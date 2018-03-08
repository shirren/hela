'use strict';

const AccountRepository   = require('../../lib/accounts').repositories.AccountRepository
  , Client                = require('../models/client')
  , errorHelper           = require('mongoose-error-helper').errorHelper;

/**
 * Export of generic error handling actions
 */
class ClientsController {

  constructor() {
    this.accountRepository = new AccountRepository();
  }

  /**
   * Return all the current clients.
   * @param {Object} req    - Http request object
   * @param {Object} res    - Http response object
   */
  index(req, res) {
    Client.find({}) // TODO: Return all the clients for a particular account
      .then(clients => res.render('clients/index', { clients: clients }));
  }

  /**
   * Create the new client
   * @param {Object} req    - Http request object
   * @param {Object} res    - Http response object
   */
  create(req, res) {
    let data = req.body;
    this.accountRepository.findById(req.params.id)
      .then(account => {
        if (account) {
          let client = new Client({
            name: data.name, redirectUris: data.redirectUris, scope: data.scopes, grantTypes: data.grantTypes,
            account: account
          });
          client
            .save()
            .then(client => res.status(201).json(client))
            .catch(err => {
              res
                .status(500)
                .json({ errors: errorHelper(err) });
            });
        } else {
          res
            .status(404)
            .end();
        }
      });
  }

  /**
   * Show an existing clients details, if we cannot find the client, then redirect
   * back to the list of clients page
   * @param {Object} req    - Http request object
   * @param {Object} res    - Http response object
   */
  show(req, res) {
    Client
      .findOne({ slug: req.params.id })
      .then(client => {
        if (client)
          res.render('clients/show', client);
        else
          res.redirect(303, '/clients');
      });
  }

  /**
   * Remove an existing client from the system. This is an async request from the browser
   * so we send back a JSON formatted response
   * @param {Object} req    - Http request object
   * @param {Object} res    - Http response object
   */
  destroy(req, res) {
    Client.deleteOne({ slug: req.params.id })
      .then( _ => {
        req.session.flash = { message: 'Application removed' };
        res.json({ success: true });
      });
  }
}

module.exports = ClientsController;