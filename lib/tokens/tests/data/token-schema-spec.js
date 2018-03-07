'use strict';

const bootstrap = require('../bootstrap')();
const expect = require('chai').expect;
const Token = require('../../data/token-schema').model;
require('mocha-mongoose')(bootstrap.connectionString);

describe('Token model', () => {
  beforeEach(bootstrap.dbConnect);

  it('should support a list of scopes', () => {
    let token = new Token({scope: ['read', 'write']});
    expect(token.scope).to.include.members(['read', 'write']);
  });

  describe('#validation', () => {
    it('should not be createable without a client', (done) => {
      let token = new Token({});
      token.validate((err) => {
        expect(err.errors.clientId.message).to.equal('Client identifier required');
        done();
      });
    });

    it('should not be createable without setting the compromised flag', (done) => {
      let token = new Token({});
      token.compromised = undefined;
      token.validate((err) => {
        expect(err.errors.compromised.message).to.equal('Compromised required');
        done();
      });
    });

    it('should not be createable without a processed flag', (done) => {
      let token = new Token({});
      token.processed = undefined;
      token.validate((err) => {
        expect(err.errors.processed.message).to.equal('Processed required');
        done();
      });
    });

    it('should not be createable without a revocation value', done => {
      let token = new Token({});
      token.revoked = null;
      token.validate(err => {
        expect(err.errors.revoked.message).to.equal('Revokeable required');
        done();
      });
    });
  });
});