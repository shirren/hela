'use strict';

const bootstrap = require('../bootstrap')();
const app = require('../test-app');
const expect = require('chai').expect;
const rest = require('supertest')(app);
require('mocha-mongoose')(bootstrap.connectionString);

describe('Clients controller', () => {
  let client;
  const factory = bootstrap.factory;

  beforeEach(bootstrap.dbConnect);

  beforeEach((done) => {
    factory
      .build('client')
      .then((factoryClient) => {
        client = factoryClient;
        done();
      })
      .catch(done);
  });

  describe('#create', () => {
    it('should return 201 for a valid client', (done) => {
      rest
        .post('/clients')
        .send(client)
        .expect(201, done);
    });

    it('should return 500 for an invalid client', (done) => {
      client.name = null;
      rest
        .post('/clients')
        .send(client)
        .expect(500, done);
    });
  });

  describe('#show', () => {
    it('should return 200 for an existing client', (done) => {
      factory
        .create('client')
        .then((c) => {
          rest.get(`/clients/${c.clientId}`)
          .expect(200, done);
        })
        .catch(done);
    });

    it('should return 404 for a missing client', (done) => {
      rest
        .get('/clients/randomid')
        .expect(404, done);
    });
  });

  describe('#index', () => {
    let client1;
    let client2;

    beforeEach((done) => {
      factory
        .createMany('client', 2)
        .then((clients) => {
          client1 = clients[0];
          client2 = clients[1];
          done();
        })
        .catch(done);
    });

    it('should not return all clients when no account id is specified', (done) => {
        rest
          .get('/clients')
          .expect({clients: []}, done);
    });

    it('should return clients for a specific account', (done) => {
      rest
        .get(`/clients?accountId=${client1.accountId}`)
        .end(function(err, result) {
          expect(err).to.be.null;
          expect(result.body.clients.length).to.eq(1);
          expect(result.body.clients[0].clientId).to.eq(client1.clientId);
          done();
        });
    });

    it('should not return clients belonging to a different account', (done) => {
      rest
        .get(`/clients?accountId=${client2.accountId}`)
        .end(function(err, result) {
          expect(result.body.clients[0].clientId).not.to.eq(client1.clientId);
          done();
        });
    });
  });

  describe('#destroy', () => {
    let client;

    beforeEach((done) => {
      factory
        .create('client')
        .then((factoryClient) => {
          client = factoryClient;
          done();
        })
        .catch(done);
    });

    it('should return 204 for a valid client deregistration', (done) => {
      rest
        .delete(`/clients/${client.clientId}`)
        .expect(204, done);
    });

    it('should return 404 for a non existent client', (done) => {
      rest
        .delete('/clients/fakeid')
        .expect(404, done);
    });
  });
});
