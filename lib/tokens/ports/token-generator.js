'use strict';

const assert = require('assert');
const AccessToken = require('../data/access-token');
const TokenRevoker = require('./token-revoker');

/**
 * Port for the token subsytem in the application. We use this port to
 * generate access tokens only.
 * @return {Object} TokenGenerator
 */
function TokenGenerator() {
  if (!new.target) {
    return new TokenGenerator();
  }
  this.tokenRevoker = new TokenRevoker();
}

/**
 * Simple utility to create the access token. This function does have a side effect in that
 * as an accesst token is created all other tokens for the client are invalidated
 * @param {Object} clientId - Client identifier
 * @param {Object} scope  - Scope for the current request
 * @return {Object} accessToken - Access token object
 */
TokenGenerator.prototype.generateAccessToken = function(clientId, scope) {
  try {
    assert(!!clientId);
    assert(!!scope);
    assert(scope.length > 0);
    // TODO: This function invalidates all tokens issued to this client, this is NOT correct behaviour
    // as a client can make multiple requests on behalf of other users for front channel requests. This
    // behaviour is only correct for back channel behaviour
    return this.tokenRevoker.revokeAccessTokens(clientId)
      .then(() => {
        let token = new AccessToken({clientId: clientId, scope: scope});
        return token.save();
      });
  } catch (e) {
    return Promise.reject(e.message);
  }
};

module.exports = TokenGenerator;
