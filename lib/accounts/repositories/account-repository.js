'use strict';

const Account = require('../data/account');

/**
 * Collection of account repository functions
 * @return {Object} AccountRepository
 */
function AccountRepository() {
  if (!new.target) {
    return new AccountRepository();
  }
}

/**
 * Find an account object using its slug
 * @param {string} id - Unique account identifier
 * @return {Object} promise - Promise for the found account
 */
AccountRepository.prototype.findById = (id) => Account.findOne({accountId: id});

module.exports = AccountRepository;
