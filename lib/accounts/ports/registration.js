'use strict';

const assert = require('assert');
const User = require('../data/user');
const Account = require('../data/account');

/**
 * This object is used to register a new user and account on the platform.
 * @return {Object} registration object
 */
function Registration() {
  if (!new.target) {
    return new Registration();
  }
}

/**
 * Validates the input parameters of the interface
 * @param {string} accountName - Account name
 */
function validateInput(accountName) {
  assert.equal(!!accountName, true);
}

/**
 * Utility function to build a user which is defaulted to use the local profile
 * @param {string} firstName
 * @param {string} lastName
 * @param {string} email
 * @param {string} password
 * @return {Object} user object
 */
function buildUser(firstName, lastName, email, password) {
  const user = new User({firstName: firstName, lastName: lastName, email: email, password: password});
  user.provider = 'local';
  return user;
}

/**
 * To register a new account we take the user's details to create a new account.
 * @param {string} accountName
 * @param {string} firstName
 * @param {string} lastName
 * @param {string} email
 * @param {string} password
 * @return {Object} promise
 */
Registration.prototype.registerNewAccount = function(accountName, firstName, lastName, email, password) {
  try {
    validateInput(accountName);
    const user = buildUser(firstName, lastName, email, password);
    return user.save()
      .then((owner) => {
        let account = new Account({name: accountName, owner: owner});
        return account.save();
      });
  } catch (e) {
    return Promise.reject(e.message);
  }
};

module.exports = Registration;
