'use strict';

const NamedRouter       = require('named-routes');

// Define filters
const ClientFilter      = require('../app/filters/client.filter')
  , RequestFilter       = require('../app/filters/request.filter')
  , TokenFilter         = require('../app/filters/token.filter');

// Define controllers
const AuthorityController = require('../app/controllers/authority.controller')
  , AccountsController     = require('../lib/accounts').AccountsController
  , ClientController      = require('../app/controllers/clients-controller')
  , ErrorController       = require('../app/controllers/errors.controller')
  , TokenController       = require('../app/controllers/token.controller');

// Define domain entry points
const Registration = require('../lib/accounts').Registration;

/**
 * All routes are defined here. Routes are added in precedence order
 * @constructor {Object} app - The express app
 */
class Router {

  /**
   * Constructor sets Express as an invariant, and also configures the reverse
   * router
   * @param {Express Object} app
   */
  constructor(app) {
    this.app = app;
    this._configureRouter(app);
    // TODO: Not sure I like this
    this._constructDomainPorts();
    this._constructControllers();
  }

  /**
   * Configure all the apps routes. This is achieved through delegation to sub-routers in the
   * configuration namespace
   */
  configure() {

    // Account routes
    this.app.post('/api/v1/accounts', (r,q) => this.accountsController.create(r,q));
    this.app.get('/api/v1/accounts/:id', (r,q) => this.accountsController.show(r,q));

    // Client routes
    this.app.get('/clients', (r,q) => this.clientsController.index(r,q));
    this.app.get('/clients/new', (r,q) => this.clientsController.add(r,q));
    this.app.post('/api/v1/accounts/:id/clients', (r,q) => this.clientsController.create(r,q));
    this.app.get('/clients/:id', (r,q) => this.clientsController.show(r,q));
    this.app.delete('/clients/:id', (r,q) => this.clientsController.destroy(r,q));

    // Authorisation routes
    let clientFilter = new ClientFilter();
    let requestFilter = new RequestFilter();
    this.app.get(
      '/authori(s|z)e',
      (r,q,n) => clientFilter.findClient(r,q,n,clientFilter.extractClientIdAndSecret),
      (r,q,n) => requestFilter.rejectUnknownResponseTypes(r,q,n),
      (r,q)   => this.authorityController.authorise(r,q)
    );

    /**
     * This route is used to generate an authorisation code for the oauth grant
     * type 'code'
     */
    this.app.post(
      '/approve',
      (r,q,n) => clientFilter.findClient(r,q,n,clientFilter.extractClientId),
      (r,q,n) => requestFilter.rejectUnknownResponseTypes(r,q,n),
      (r,q,n) => requestFilter.processCodeRequest(r,q,n),
      (r,q)   => this.authorityController.approve(r,q)
    );

    /**
     * Once the client has obtained the authorisation code, it can exchange this code
     * for a token. The token generated on the platform will be a JWT token. Note that
     * regardless of how processing proceeds the token is invalidated.
     */
    let tokenFilter = new TokenFilter();
    this.app.post(
      '/token',
      (r,q,n) => tokenFilter.rejectUnknownGrantTypes(r,q,n),
      (r,q,n) => clientFilter.findClient(r,q,n,clientFilter.extractClientIdAndSecret),
      (r,q,n) => tokenFilter.processAuthCodeGrantType(r,q,n),
      (r,q,n) => tokenFilter.processRefreshTokenGrantType(r,q,n),
      (r,q,n) => tokenFilter.processClientCredentialsGrantType(r,q,n),
      (r,q,n) => tokenFilter.processPasswordGrantType(r,q,n),
      (r,q)   => this.tokenController.token(r,q)
    );

    // About page route
    this.app.get('/about', (req,res) => {
      res.render('about', {
        pageTestScript: '/qa/tests-about.js'
      });
    });

    this.app.get('/', (req,res) => res.render('home'));

    /**
     * Error handlers
     */
    this.app.use(this.errorsController.notFound); // 404
    this.app.use(this.errorsController.serverError); // 500
  }

  /**
   * Configure the router for use in Express
   */
  _configureRouter(app) {
    let router = new NamedRouter();
    router.extendExpress(app);
    router.registerAppHelpers(app);
  }

  /**
   * Create all the controller objects
   */
  _constructControllers() {
    this.accountsController = new AccountsController(this.registration);
    this.clientsController = new ClientController();
    this.authorityController = new AuthorityController();
    this.errorsController = new ErrorController();
    this.tokenController = new TokenController();
  }

  /**
   * Create all domain ports
   */
  _constructDomainPorts() {
    this.registration = new Registration();
  }
}

module.exports = Router;