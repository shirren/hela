'use strict';

const bootstrap = require('../bootstrap')();
const expect = require('chai').expect;
const ClientRegistration = require('../../ports/client-registration');
require('mongoose');
require('mocha-mongoose')(bootstrap.connectionString);

describe('Client registration', () => {
  let clientRegistration = new ClientRegistration();

  beforeEach(bootstrap.dbConnect);

  describe('#register', () => {
    it('should register a new client for a given account', (done) => {
      clientRegistration.register('cloudId', 'accountId', ['http://localhost:3000/test1'])
        .then((client) => {
          expect(client).not.be.null;
          expect(client.id).not.be.null;
          expect(client.name).to.eq('cloudId');
          done();
        })
        .catch(done);
    });

    it('should not register a duplicate client for the same account', (done) => {
      clientRegistration.register('cloudId', 'accountId', ['http://localhost:3000/test1'])
        .then(() => {
          return clientRegistration.register('cloudId', 'accountId', ['http://localhost:3000/test1']);
        })
        .catch((err) => {
          expect(err).not.to.be.null;
          done();
        });
    });

    it('should not register a duplicate client irregardless of case for the same account', (done) => {
      clientRegistration.register('cloudId', 'accountId', ['http://localhost:3000/test1'])
        .then((_) => {
          return clientRegistration.register('cloudid', 'accountId', ['http://localhost:3000/test1']);
        })
        .catch((err) => {
          expect(err).not.to.be.null;
          done();
        });
    });
  });

  describe('#deregister', () => {
    let client;

    beforeEach((done) => {
      bootstrap.factory.create('client')
        .then((factoryClient) => {
          client = factoryClient;
          done();
        })
        .catch(done);
    });

    it('should deregister a valid registered client', (done) => {
      clientRegistration.deregister(client.name, client.accountId)
        .then((resp) => {
          expect(resp).to.be.truthy;
          done();
        })
        .catch(done);
    });

    it('should not deregister a invalid registered client', (done) => {
      clientRegistration.deregister('fakeId', 'accountId')
        .catch((err) => {
          expect(err).not.to.be.null;
          done();
        });
    });

    it('should not deregister a valid client registered for a different account', (done) => {
      clientRegistration.deregister(client.name, 'fakeId')
        .catch((err) => {
          expect(err).not.to.be.null;
          done();
        });
    });
  });
});
