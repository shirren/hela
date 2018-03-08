'use strict';

const bootstrap    = require('../../bootstrap')()
  , _clearDb       = require('mocha-mongoose')(bootstrap.connectionString)
  , expect         = require('chai').expect
  , mongoose       = require('mongoose')
  , Token          = require('../../../app/models/schemas/token.schema').model;

describe('Token model', () => {

  beforeEach(done => {
    if (!mongoose.connection.db) {
      mongoose.connect(bootstrap.connectionString, done);
    } else {
      done();
    }
  });

  it('should support a list of scopes', () => {
    let token = new Token({ scope: ['read', 'write'] });
    expect(token.scope).to.include.members(['read', 'write']);
  });

  describe('#validation', () => {

    it('should not be createable without a client', done => {
      let token = new Token({});
      token.validate(err => {
        expect(err.errors.client.message).to.equal('Client required');
        done();
      });
    });

    it('should not be createable without setting the compromised flag', done => {
      let token = new Token({});
      token.compromised = undefined;
      token.validate(err => {
        expect(err.errors.compromised.message).to.equal('Compromised required');
        done();
      });
    });

    it('should not be createable without a processed flag', done => {
      let token = new Token({});
      token.processed = undefined;
      token.validate(err => {
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