'use strict';

const nconf       = require('nconf')
  , bodyParser    = require('body-parser')
  , compression   = require('compression')
  , cookieParser  = require('cookie-parser')
  , session       = require('express-session');

/**
 * This class is used to setup and configure the express apps middleware
 */
class Middleware {

  /**
   * For middleware to function we need access to the Express application
   * or object
   * @param {ExpressObject} app
   */
  constructor(app) {
    this.app = app;
  }

  /**
   * This function needs to be invoked to configure node and express middleware
   */
  configure() {

    /**
     * Setup connect middle ware. We do it here because we want to make sure
     * it is setup prior to anything else
     */
    this.app.use(compression({ filter: this.shouldCompress }));
    this.app.use(bodyParser.urlencoded({ extended: true }));

    /**
     * Configure express to generate cookies and session state via cookies
     */
    this.app.use(cookieParser(nconf.get('COOKIE_SECRET')));
    this.app.use(session({
      resave: false,
      saveUninitialized: false,
      secret: nconf.get('COOKIE_SECRET')
    }));

    // We transfer the flash message from the session into the context
    // for use in the view, and then delete from the session so it is
    // only available for a single roundtrip
    this.app.use((req, res, next) => {
      res.locals.flash = req.session.flash;
      delete req.session.flash;
      next();
    });

    // Setup some middleware to turn on page level tests
    this.app.use((req, res, next) => {
      res.locals.showTests = this.app.get('env') !== 'production' && req.query.test === '1';
      next();
    });

    // Register which worker is receiving the request
    this.app.use(function(req, res, next) {
      require('cluster');
      next();
    });
  }

  shouldCompress(req, res) {
    if (req.headers['x-no-compression']) {
      // don't compress responses with this request header
      return false;
    }
    // fallback to standard filter function
    return compression.filter(req, res);
  }
}

module.exports = Middleware;