'use strict';

const Client = require('../data/client');
const ClientRepository = require('../repositories/client-repository');

/**
 * This primary port is used to encapsulate the business logic of registering a new client
 * @return {Object} ClientRegistration
 */
function ClientRegistration() {
  if (!new.target) {
    return new ClientRegistration();
  }
  this.repo = new ClientRepository();
}

/**
 * Register a new client on the platform for the client. The name needs to be unique
 * for the client
 * @param {string} name - Friendly name for the account
 * @param {string} accountId - Unique id of the account to which this client belongs
 * @param {string[]} redirectUris - list of redirect uris for the client
 * @return {Object} promise
 */
ClientRegistration.prototype.register = function(name, accountId, redirectUris) {
  return this.repo
    .findByNameAndAccountId(name, accountId)
    .then((dup) => {
      let client = new Client({name: name, redirectUris: redirectUris, accountId: accountId});
      return dup ? Promise.reject(new Error('Duplicate client')) : client.save();
    });
};

/**
 * De-register a client that belongs to a particular account. We cannot deregister clients which
 * are part of another account heirarchy
 * @param {string} name - Name of the client as provided by the user
 * @param {string} accountId - Unique id of the account to which this client belongs
 * @return {Object} promise
 */
ClientRegistration.prototype.deregister = function(name, accountId) {
  return this.repo
    .findByNameAndAccountId(name, accountId)
    .then((client) =>
      client ? this.repo.deleteById(client.clientId) : Promise.reject(new Error('Client not found'))
    );
};

module.exports = ClientRegistration;
