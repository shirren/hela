'use strict';

const Client = require('../data/client');

/**
 * Collection of client repository functions
 * @return {Object} CientRepository
 */
function ClientRepository() {
  if (!new.target) {
    return new ClientRepository();
  }
}

/**
  * Find an client object using its client identifier
  * @param {string} id - Unique identifier of the client
  * @return {Object} promise - Promise for the client find
  */
ClientRepository.prototype.findById = (id) => Client.findOne({clientId: id});

/**
 * Find all by account id
 * @param {string} accountId - Account identifier
 * @return {Object} promise - Promise for the find of all clients by account id
 */
ClientRepository.prototype.findByAccountId = (accountId) => Client.find({accountId: accountId});

/**
 * Find one by client name and account identifier
 * @param {string} name - Name of the client
 * @param {string} accountId - Account identifier
 * @return {Object} promise - Promise for the find of client by name and account id
 */
ClientRepository.prototype.findByNameAndAccountId = (name, accountId) =>
  Client.findOne({name: {$regex: name, $options: 'i'}, accountId: accountId});

/**
 * Delete a single client from the system
 * @param {string} id - Unique client identifier
 * @return {Object} promise - Promise for the deleted client
 */
ClientRepository.prototype.deleteById = (id) => Client.deleteOne({clientId: id});

module.exports = ClientRepository;
