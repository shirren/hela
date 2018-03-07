'use strict';

const assert = require('assert');
const AccessToken = require('../data/access-token');

/**
 * Token revoker, revokes all access token generated for a particular client
 * @return {Object} TokenRevoker
 */
function TokenRevoker() {
  if (!new.target) {
    return new TokenRevoker();
  }
}

/**
 * Revoke access tokens for a particular client using its client identity
 * @param {string} clientId - Unique identifier of a client
 * @return {Object} promise - AccessToken update promise
 */
TokenRevoker.prototype.revokeAccessTokens = function(clientId) {
  try {
    assert(!!clientId);
    return AccessToken.update({clientId: clientId}, {revoked: true}, {multi: true});
  } catch (e) {
    // TODO: Is this the best way to obfuscate and hide an invalid client id?
    return Promise.resolve('Done');
  }
};

module.exports = TokenRevoker;
