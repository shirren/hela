'use strict';

const AccountRepository = require('../repositories/account-repository');
const errorHelper = require('mongoose-error-helper').errorHelper;

/**
 * The accounts controller is to be only consumed by the single SPA which
 * utilises this back-end
 * @param {Object} registration - Registration port
 * @return {Object} AccountsController
 */
function AccountsController(registration) {
  if (!new.target) {
    return new AccountsController(registration);
  }
  this.registration = registration;
  this.repository = new AccountRepository();
}

/**
 * Register a new account on the platform. To register a new account the user needs to
 * have been create already. The owning account along with other required fields should be passed
 * through in the request body.
 * @param {Object} req    - Http request object
 * @param {Object} res    - Http response object
 */
AccountsController.prototype.create = function(req, res) {
  const {body} = req;
  this.registration
    .registerNewAccount(body.name, body.firstName, body.lastName, body.email, body.password)
    .then((account) => res.status(201).json(account))
    .catch((err) => res.status(500).json({errors: errorHelper(err)}));
};

/**
 * Retrieve an existing account details.
 * @param {Object} req    - Http request object
 * @param {Object} res    - Http response object
 */
AccountsController.prototype.show = function(req, res) {
  this.repository
    .findById(req.params.id)
    .then((account) => account ? res.json(account) : res.status(404).json(account));
};

module.exports = AccountsController;
