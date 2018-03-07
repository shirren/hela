'use strict';

const User = require('../data/user');

/**
 * Collection of user repo functions
 * @return {Object} UserRepository
 */
function UserRepository() {
  if (!new.target) {
    return new UserRepository();
  }
}

/**
 * This function finds a user by their username, then "authenticates" the user to make
 * sure the username and password match
 * @param {String} email    - Email of a user
 * @param {String} password - Raw version of user password
 * @return {Object} promise
 */
UserRepository.prototype.findByUserNameAndPassword = (email, password) => {
  return User.findOne({email: email})
    .then((user) => {
      if (user && user.authenticate(password)) {
        return Promise.resolve(true);
      }
      return Promise.reject(false);
    })
    .catch((_) => Promise.reject(false));
};

module.exports = UserRepository;
