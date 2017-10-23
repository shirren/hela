'use strict';

const bootstrap          = require('../../../bootstrap')()
  , app                  = require('../../../../app')
  , _clearDb             = require('mocha-mongoose')(bootstrap.connectionString)
  , Client               = require('../../../../app/models/client')
  , expect               = require('chai').expect
  , rest                 = require('supertest')(app);

describe.skip('Clients controller', () => {

  let client;

  beforeEach(bootstrap.dbConnect);

  beforeEach(done => {
    bootstrap
      .factory
      .build('client_with_no_account')
      .then(factoryClient => {
        client = factoryClient;
        done();
      })
      .catch(done);
  });

  context('where the account does not exist', () => {

    describe('#create', () => {

      it('should return 404 for a valid client', done => {
        rest
          .post('/api/v1/accounts/unknownaccount/clients')
          .send(client)
          .expect(404, done);
      });
    });

  });

  context('where the account does exist', () => {

    it('should return 201 for a valid client', done => {
      rest
        .post('/api/v1/accounts/accountslug/clients')
        .send(client)
        .expect(201, done);
    });

    it('should associate the client to the account', done => {
      rest
        .post('/api/v1/accounts/accountslug/clients')
        .send(client)
        .expect(201, _ => {
          Client
            .findOne({ name: client.name.toLowerCase() })
            .then(client => {
              expect(client.account).not.to.be.null;
            });
          done();
        });
    });

    it('should return 500 for a client with no name', done => {
      client.name = null;
      rest
        .post('/api/v1/accounts/accountslug/clients')
        .send(client)
        .expect(500, done);
    });
  });
});