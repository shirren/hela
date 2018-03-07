'use strict';

const bootstrap = require('../bootstrap')();
const expect = require('chai').expect;
const TokenGenerator = require('../../ports/token-generator');
require('mocha-mongoose')(bootstrap.connectionString);

describe('Token generation', () => {
  const tokenGenerator = new TokenGenerator();
  const {factory} = bootstrap;
  beforeEach(bootstrap.dbConnect);

  describe('#generateToken', () => {
    it('should not generate a token for an unspecified clientId', (done) => {
      tokenGenerator
        .generateAccessToken(null, ['read'])
        .catch((err) => {
          expect(err).not.be.null;
          done();
        });
    });

    it('should not generate a token for an unspecified scope', (done) => {
      tokenGenerator
        .generateAccessToken('randomId', null)
        .catch((err) => {
          expect(err).not.be.null;
          done();
        });
    });

    it('should not generate a token for an emtpy scope', (done) => {
      tokenGenerator
        .generateAccessToken('randomId', [])
        .catch((err) => {
          expect(err).not.be.null;
          done();
        });
    });

    it('should revoke all other access tokens issued to the same client', (done) => {
      factory
        .create('access token')
        .then((accessToken) => {
          expect(accessToken.revoked).to.be.falsey;
          tokenGenerator
            .generateAccessToken(accessToken.clientId, ['read'])
            .then((newAccessToken) => {
              expect(newAccessToken.revoked).to.be.falsey;
              expect(accessToken.revoked).to.be.truthy;
              done();
            });
        });
    });
  });
});
