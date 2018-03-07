'use strict';

const bootstrap = require('../bootstrap')();
const mongoose = require('mongoose');
const expect = require('chai').expect;
const Client = require('../../data/client');
require('mocha-mongoose')(bootstrap.connectionString);

describe('Client model', () => {
  beforeEach((done) => {
    if (!mongoose.connection.db) {
      mongoose.connect(bootstrap.connectionString, done);
    } else {
      done();
    }
  });

  it('should be able to return the primary redirect uri', () => {
    let client = new Client({
      name: 'nike_app',
      redirectUris: ['http://localhost:3000/test1', 'http://localhost:3000/test2'],
      accountId: 'account',
    });
    expect(client.redirectUri).to.equal('http://localhost:3000/test1');
  });

  it('should be able to handle an empty redirect uri list', () => {
    let client = new Client({name: 'nike_app', redirectUris: [], accountId: 'account'});
    expect(client.redirectUri).to.equal(undefined);
  });

  describe('#save', () => {
    it('should auto-generate a client id', (done) => {
      let client = new Client({name: 'nike_app', redirectUris: ['http://localhost:3000/test'], accountId: 'account'});
      client.save()
        .then((inst) => {
          expect(inst.clientId).not.to.be.null;
          done();
        })
        .catch((err) => done(err.errors));
    });

    it('should auto-generate a client secret', (done) => {
      let client = new Client({name: 'nike_app', redirectUris: ['http://localhost:3000/test'], accountId: 'account'});
      client.save()
        .then((client) => {
          expect(client.clientSecret).not.to.be.null;
          done();
        })
        .catch((err) => done(err));
    });

    it('should accept a custom client id', (done) => {
      let client = new Client({clientId: '123', name: 'nike_app', redirectUris: ['http://localhost:3000/test'],
        accountId: 'account'});
      client.save()
        .then((client) => {
          expect(client.clientId).to.equal('123');
          done();
        })
        .catch((err) => done(err));
    });

    it('should forbid duplicate clients', (done) => {
      let client = new Client({name: 'nike_app', redirectUris: ['http://localhost:3000/test'], accountId: 'account'});
      client.save()
        .then(() => {
          let client = new Client({name: 'nike_app', account: account});
          return client.save();
        })
        .catch((err) => {
          expect(err).not.to.be.null;
          done();
        });
    });

    it('should not modify client secret on an update', (done) => {
      let secret = null;
      let client = new Client({name: 'Nike_App', redirectUris: ['http://localhost:3000/test'], accountId: 'account'});
      client.save()
        .then((client) => {
          secret = client.clientSecret;
          client.name = 'addidas_app';
          return client.save();
        })
        .then((client) => {
          expect(client.clientSecret).to.equal(secret);
          done();
        })
        .catch((err) => done(err));
    });

    it('should not modify client id on an update', (done) => {
      let id = null;
      let client = new Client({name: 'Nike_App', redirectUris: ['http://localhost:3000/test'], accountId: 'account'});
      client.save()
        .then((client) => {
          id = client.clientId;
          client.name = 'addidas_app';
          return client.save();
        })
        .then((client) => {
          expect(client.clientId).to.equal(id);
          done();
        })
        .catch((err) => done(err));
    });
  });

  describe('#validation', () => {
    it('should not be valid without a name', (done) => {
      let client = new Client({redirectUris: ['http://localhost:3000/test'], accountId: 'account'});
      client
        .validate((err) => {
          expect(err.errors.name.message).to.equal('Name required');
          done();
        });
    });

    it('should not be valid without a valid redirect uri', (done) => {
      let client = new Client({name: 'Nike_App', redirectUris: ['test'], accountId: 'account'});
      client.validate((err) => {
          expect(err.errors['redirectUris.0'].message).to.equal('url is invalid');
          done();
        });
    });

    it('should not be valid without an account', (done) => {
      let client = new Client({name: 'Nike_App', redirectUris: ['http://localhost']});
      client.validate((err) => {
          expect(err.errors.accountId.message).to.equal('Account required');
          done();
        });
    });
  });
});
