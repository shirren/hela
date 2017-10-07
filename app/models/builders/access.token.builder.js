'use strict';

const AccessToken = require('../access.token');

/**
 * Bounded context for dealing with AccessTokens
 */
module.exports = function() {

  return {
    createAccessToken: createAccessToken
  };

  /**
   * Create a new Access token for a specific client
   * @param {Object} client - Client object
   * @param {Object} scope  - Scope of original request
   */
  function createAccessToken(client, scope) {
    let token = new AccessToken({ client: client, scope: scope });
    return token.save();
  }
};