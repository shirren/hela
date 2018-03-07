'use strict';

const bootstrap = require('../bootstrap')();
const expect = require('chai').expect;
const TokenRevoker = require('../../ports/token-revoker');
require('mocha-mongoose')(bootstrap.connectionString);

describe('Token generation', () => {
  const tokenRevoker = new TokenRevoker();
  const {factory} = bootstrap;
  beforeEach(bootstrap.dbConnect);

  describe('#revokeAccessToken', () => {
    it('should obfuscate illegal client ids', (done) => {
      tokenRevoker
        .revokeAccessTokens(null)
        .then(() => done());
    });

    it('should obfuscate invalid client ids', (done) => {
      tokenRevoker
        .revokeAccessTokens('randomId')
        .then(() => done());
    });

    it('should revoke access tokens issued to the client', (done) => {
      factory
        .create('access token')
        .then((accessToken) => {
          expect(accessToken.revoked).to.be.falsey;
          tokenRevoker
            .revokeAccessTokens(accessToken.clientId)
            .then(() => {
              expect(accessToken.revoked).to.be.truthy;
              done();
            });
        });
    });
  });
});
