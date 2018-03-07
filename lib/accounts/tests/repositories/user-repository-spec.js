'use strict';

const bootstrap    = require('../bootstrap')()
  , _clearDb       = require('mocha-mongoose')(bootstrap.connectionString)
  , expect         = require('chai').expect
  , mongoose       = require('mongoose')
  , UserRepository = require('../../repositories/user-repository');

describe('User repository model', () => {

  let userRepository = new UserRepository();

  beforeEach(done => {
    if (!mongoose.connection.db) {
      mongoose.connect(bootstrap.connectionString, done);
    } else {
      done();
    }
  });

  context('for a non existing user', () => {

    it('should return false wrapped in a promise', done => {
      userRepository.findByUserNameAndPassword('invalid', 'invalid')
        .catch(result => {
          expect(result).to.be.false;
          done();
        });
    });
  });

  context('for an existing user', () => {

    it('should return false wrapped in a promise for an invalid password', done => {
      bootstrap.factory
        .create('user')
        .then(user => {
          userRepository.findByUserNameAndPassword(user.email, 'invalid')
            .catch(result => {
              expect(result).to.be.false;
              done();
            });
        });
    });

    it('should return true wrapped in a promise for a valid password', done => {
      bootstrap.factory
        .create('user')
        .then(user => {
          userRepository.findByUserNameAndPassword(user.email, 'password')
            .then(result => {
              expect(result).to.be.true;
              done();
            });
        });
    });
  });
});
