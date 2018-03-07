'use strict';

const bootstrap = require('../bootstrap')();
const expect = require('chai').expect;
const Registration = require('../../ports/registration');
const User = require('../../data/user');
require('mocha-mongoose')(bootstrap.connectionString);

describe('Registration port', () => {
  let reg = new Registration();

  it('should create a new account upon registration', (done) => {
    reg
      .registerNewAccount('new-account', 'first name', 'last name', 'first@last.com', 'password')
      .then((account) => {
        expect(account).not.to.be.null;
        done();
      })
      .catch(done);
  });

  it('should create a new user upon registration', (done) => {
    reg
      .registerNewAccount('new-account', 'first name', 'last name', 'first@last.com', 'password')
      .then((_) => {
        User.find({email: 'first@last.com'})
          .then((user) => {
            expect(user).not.to.be.null;
            done();
          });
      })
      .catch(done);
  });

  it('should handle null account names gracefully', (done) => {
    reg
      .registerNewAccount(null, 'first name', 'last name', 'first@last.com', 'password')
      .catch((err) => {
        expect(err).not.to.be.null;
        done();
      });
  });

  it('should handle undefined account names gracefully', (done) => {
    reg
      .registerNewAccount(undefined, 'first name', 'last name', 'first@last.com', 'password')
      .catch((err) => {
        expect(err).not.to.be.null;
        done();
      });
  });

  it('should handle null no first names gracefully', (done) => {
    reg
      .registerNewAccount('account name', null, 'last name', 'first@last.com', 'password')
      .catch((err) => {
        expect(err).not.to.be.null;
        done();
      });
  });

  it('should handle null no last names gracefully', (done) => {
    reg
      .registerNewAccount('account name', 'first name', null, 'first@last.com', 'password')
      .catch((err) => {
        expect(err).not.to.be.null;
        done();
      });
  });

  it('should handle null emails gracefully', (done) => {
    reg
      .registerNewAccount('account name', 'first name', 'last name', null, 'password')
      .catch((err) => {
        expect(err).not.to.be.null;
        done();
      });
  });

  it('should handle null password gracefully', (done) => {
    reg
      .registerNewAccount('account name', 'first name', 'last name', 'first@last.com', null)
      .catch((err) => {
        expect(err).not.to.be.null;
        done();
      });
  });
});
