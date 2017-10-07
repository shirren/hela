'use strict';

const AccessTokenBuilder = require('../models/builders/access.token.builder')
  , RefreshToken         = require('../models/refresh.token');

/**
 * Tokens are generated when access is granted. This controller is build to issue
 * these tokens. All token generation happens using the back channel
 */
module.exports = function() {

  return {
    token: token
  };

  /**
   * Generate the access tokens for a client. Before we issue new tokens to a client we need to make sure that all the existing
   * access and refresh tokens have been invalidated.
   * @param {Object} req    - Http request object
   * @param {Object} res    - Http response object
   */
  function token(req, res) {
    const { client, scope, backChannelRequest } = req;
    const accessTokenPromise = createAccessToken(client, scope);
    let responseHandler = response => {
      if (response.hasOwnProperty('error')) {
        res.status(400).json(response);
      } else {
        res.status(200).json(response);
      }
    };

    if (backChannelRequest) {
      createBackChannelResponse(accessTokenPromise).then(responseHandler);
    } else {
      createFrontChannelResponse(req, accessTokenPromise).then(responseHandler);
    }
  }

  /**
   * Sends a front channel token response which includes a refresh token
   * @param {object} req - Http request object
   * @param {object} accessTokenPromise - Access token wrappen in a promise
   */
  function createFrontChannelResponse(req, accessTokenPromise) {
    const { client, scope } = req;
    let accessToken;
    return accessTokenPromise
      .then(token => {
        accessToken = token;
        return RefreshToken.findOne({ key: req.body.refresh_token });
      })
      .then(refreshToken => {
        // We have chosen not to refresh the Refresh token, this is more secure. The spec is a bit ambiguous on this
        if (!refreshToken) {
          refreshToken = new RefreshToken({ client: client, scope: scope });
        } else {
          refreshToken.scope = scope;
        }
        return refreshToken.save();
      })
      .then(refreshToken => {
        return {
          access_token: accessToken.key, expires_in: accessToken.expiresIn, refresh_token: refreshToken.key,
          scope: refreshToken.scope.join(' '), token_type: 'Bearer'
        };
      })
      .catch(_ => {
        return { error: 'server error' };
      });
  }

  /**
   * Sends a back channel token response which does not include a refresh token
   * @param {object} accessTokenPromise - Access token wrapped in a promise
   */
  function createBackChannelResponse(accessTokenPromise) {
    return accessTokenPromise
      .then(accessToken => {
        return {
          access_token: accessToken.key,
          expires_in: accessToken.expiresIn,
          scope: accessToken.scope.join(' '),
          token_type: 'Bearer'
        };
      })
      .catch(_ => {
        return { error: 'server error' };
      });
  }

  /**
   * Simple utility to create the access token. This function does have a side effect in that
   * as an accesst token is created all other tokens for the client are invalidated
   * @param {Object} client - Client which has been granted access
   * @param {Object} scope  - Scope for the current request
   */
  function createAccessToken(client, scope) {
    // TODO: This function invalidates all tokens issued to this client, this is NOT correct behaviour
    // as a client can make multiple requests on behalf of other users for front channel requests. This
    // behaviour is only correct for back channel behaviour
    return client.invalidateOtherTokens()
      .then(_ => {
        let builder = new AccessTokenBuilder();
        return builder.createAccessToken(client, scope);
      });
  }
};