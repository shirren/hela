'use strict';

const AccessTokenBuilder = require('../models/builders/access.token.builder');
const RefreshToken = require('../models/refresh.token');

/**
 * Token controller constructor
 * @return {Object} TokenController
 */
function TokenController() {
  if (!new.target) {
    return new TokenController();
  }
}

/**
 * Generate the access tokens for a client. Before we issue new tokens to a client we need to make
 * sure that all the existing
 * access and refresh tokens have been invalidated.
 * @param {Object} req    - Http request object
 * @param {Object} res    - Http response object
 */
TokenController.prototype.token = function(req, res) {
  const {client, scope, backChannelRequest} = req;
  const accessTokenPromise = createAccessToken(client, scope);
  let responseHandler = (response) => {
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
};

/**
 * Sends a front channel token response which includes a refresh token
 * @param {Object} req - Http request object
 * @param {Object} accessTokenPromise - Access token wrappen in a promise
 * @return {Object} promise - Refresh token response
 */
function createFrontChannelResponse(req, accessTokenPromise) {
  const {client, scope} = req;
  let accessToken;
  return accessTokenPromise
    .then((token) => {
      accessToken = token;
      return RefreshToken.findOne({key: req.body.refresh_token});
    })
    .then((refreshToken) => {
      // We have chosen not to refresh the Refresh token, this is more secure. The spec is a bit ambiguous on this
      if (!refreshToken) {
        refreshToken = new RefreshToken({client: client, scope: scope});
      } else {
        refreshToken.scope = scope;
      }
      return refreshToken.save();
    })
    .then((refreshToken) => {
      return {
        access_token: accessToken.key, expires_in: accessToken.expiresIn, refresh_token: refreshToken.key,
        scope: refreshToken.scope.join(' '), token_type: 'Bearer',
      };
    })
    .catch((_) => {
      return {error: 'server error'};
    });
}

/**
 * Sends a back channel token response which does not include a refresh token
 * @param {object} accessTokenPromise - Access token wrapped in a promise
 * @return {Object} access token - JSON access token object
 */
function createBackChannelResponse(accessTokenPromise) {
  return accessTokenPromise
    .then((accessToken) => {
      return {
        access_token: accessToken.key,
        expires_in: accessToken.expiresIn,
        scope: accessToken.scope.join(' '),
        token_type: 'Bearer',
      };
    })
    .catch((_) => {
      return {error: 'server error'};
    });
}

/**
 * Tokens are generated when access is granted. This controller is build to issue
 * these tokens. All token generation happens using the back channel
 */
module.exports = TokenController;
