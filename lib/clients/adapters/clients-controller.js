'use strict';

const errorHelper = require('mongoose-error-helper').errorHelper;

/**
 * The client controller is a client domain adapter provided to support the MVC construct in the Hela app
 * This controller requires the client repository 'port' to interfact with the data tier
 * @param {Object} clientRepository - Repository object used to query for client objects
 * @param {Object} registration - We use this module to register new clients
 * @return {Object} ClientsController
 */
function ClientsController(clientRepository, registration) {
  if (!new.target) {
    return new ClientsController(clientRepository, registration);
  }
  this.clientRepository = clientRepository;
  this.registration = registration;
}

/**
 * Return all the current clients.
 * @param {Object} req - Http request object
 * @param {Object} res - Http response object
 */
ClientsController.prototype.index = function(req, res) {
  this.clientRepository
    .findByAccountId(req.query.accountId)
    .then((clients) => res.json({clients: clients}))
    .catch((err) => res.status(500).json({errors: errorHelper(err)}));
};

/**
 * Create the new client
 * @param {Object} req    - Http request object
 * @param {Object} res    - Http response object
 */
ClientsController.prototype.create = function(req, res) {
  let data = req.body;
  this.registration
    .register(data.name, data.accountId, data.redirectUris)
    .then((client) => res.status(201).json(client))
    .catch((err) => res.status(500).json({errors: errorHelper(err)}));
};

/**
 * Show an existing clients details, if we cannot find the client, then redirect
 * back to the list of clients page
 * @param {Object} req    - Http request object
 * @param {Object} res    - Http response object
 */
ClientsController.prototype.show = function(req, res) {
  this.clientRepository
    .findById(req.params.id)
    .then((client) => client ? res.json(client) : res.status(404).end())
    .catch((err) => res.status(500).json({errors: errorHelper(err)}));
};

/**
 * Remove an existing client from the system. This is an async request from the browser
 * so we send back a JSON formatted response
 * @param {Object} req    - Http request object
 * @param {Object} res    - Http response object
 */
ClientsController.prototype.destroy = function(req, res) {
  this.clientRepository
    .findById(req.params.id)
    .then((client) => {
      client ? this.registration.deregister(client.name, client.accountId) : res.status(404).end();
    })
    .then((_) => res.status(204).end())
    .catch((err) => res.status(500).json({errors: errorHelper(err)}));
};

module.exports = ClientsController;
