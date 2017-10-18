'use strict';

const bootstrap          = require('../../../bootstrap')()
  , app                  = require('../../../../app')
  , _clearDb             = require('mocha-mongoose')(bootstrap.connectionString)
  , mongoose             = require('mongoose')
  , rest                 = require('supertest')(app);

describe('Accounts controller', () => {

  let owner;

  beforeEach(done => {
    if (!mongoose.connection.db) {
      mongoose.connect(bootstrap.connectionString, done);
    } else {
      done();
    }
  });

  beforeEach(done => {
    bootstrap.factory
      .create('user')
      .then(factoryUser => {
        owner = factoryUser;
        done();
      })
      .catch(done);
  });

  context('where the user does not exist', () => {

    describe('#create', () => {

      it('should return 500 for missing owner attribute', done => {
        rest
          .post('/api/v1/accounts')
          .send({ name: 'account name' })
          .expect(500, done);
      });

      it('should return 500 for unknown owner', done => {
        rest
          .post('/api/v1/accounts')
          .send({ name: 'account name', owner: 'unknown user' })
          .expect(500, done);
      });
    });

    describe('#show', () => {

      it('should return 404 for unknown account', done => {
        rest
          .get('/api/v1/accounts/unknownaccount')
          .expect(404, done);
      });

      it('should return 200 with account details for a known account', done => {
        bootstrap
          .factory
          .create('account')
          .then(account => {
            rest
              .get(`/api/v1/accounts/${account.slug}`)
              .expect(200, done);
          });
      });
    });
  });

  context('where the account is not named', () => {

    it('should return 500', done => {
      rest
        .post('/api/v1/accounts')
        .send({ owner: owner.slug })
        .expect(500, done);
    });
  });

  it('should create a valid account', done => {
    rest
      .post('/api/v1/accounts')
      .send({ name: 'name', owner: owner.slug })
      .expect(201, done);
  });
});