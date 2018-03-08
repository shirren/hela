'use strict';

const AuthorisationRequest = require('../models/authorisation.request')
  , RefreshToken           = require('../models/refresh.token')
  , ScopeHelper            = require('../../lib/helpers/scope.helpers')
  , UrlBuilder             = require('../../lib/http/url.builder')
  , UserRepository         = require('../../lib/accounts').UserRepository
  , __                     = require('underscore');

/**
 *  Provides a filter to check if the grant type is supported. If the grant type is supported
 * then the filter hands over control to the controller
 */
module.exports = function() {

  return {
    rejectUnknownGrantTypes: rejectUnknownGrantTypes,
    processAuthCodeGrantType: processAuthCodeGrantType,
    processClientCredentialsGrantType: processClientCredentialsGrantType,
    processRefreshTokenGrantType: processRefreshTokenGrantType,
    processPasswordGrantType: processPasswordGrantType,
    validAuthorisationCode: validAuthorisationCode,
    processAuthRequest: processAuthRequest
  };

  /**
   * If the grant type is supported then the filter hands over control to the controller or the
   * next filter in the sequence. If this application does not support the specific grant type
   * the chain is halted
   * @param {Object} req    - Http request object
   * @param {Object} res    - Http response object
   * @param {Function} next - Middleware function to invoke next handler in the pipeline
   */
  function rejectUnknownGrantTypes(req, res, next) {
    const supportedGrantTypes = ['authorization_code', 'refresh_token', 'client_credentials', 'password'];
    if (supportedGrantTypes.includes(req.body.grant_type)) {
      // We treat password as a 'backchannel' because fundamentally there is no redirect
      if (req.body.grant_type === 'client_credentials' || req.body.grant_type === 'password') {
        req.backChannelRequest = true;
      } else {
        req.backChannelRequest = false;
      }
      next();
    } else {
      res.status(400).json({ error: 'unsupported_grant_type' });
    }
  }

  /**
   * This filter is designed to handle the authorization_code grant type only. This grant type is specified in the
   * body of the request as it is part of a token issue which is a HTTP post. This grant type is used where there
   * are 3 participants in the auth process, the client, the user and the protected resource.
   * @param {Object} req    - Http request object
   * @param {Object} res    - Http response object
   * @param {Function} next - Middleware function to invoke next handler in the pipeline
   */
  function processAuthCodeGrantType(req, res, next) {
    if (req.body.grant_type === 'authorization_code') {
      // Validate the auth code, and mark it as processed, then process the auth request
      validAuthorisationCode(req, res)
        .then(_  => processAuthRequest(req, res, next))
        .catch(_ => res.status(401).json({ error: 'invalid_grant' }));
    } else {
      next();
    }
  }

  /**
   * This filter is designed to handle the authorization_code grant type only. This grant type is specified in the
   * body of the request as it is part of a token issue which is a HTTP post. This grant type is used where there
   * are 3 participants in the auth process, the client, the user and the protected resource.
   * @param {Object} req    - Http request object
   * @param {Object} res    - Http response object
   * @param {Function} next - Middleware function to invoke next handler in the pipeline
   */
  function processClientCredentialsGrantType(req, res, next) {
    const { client } = req;
    if (req.body.grant_type === 'client_credentials') {
      if (client.supportsGrant(req.body.grant_type)) {
        let scopeHelper = new ScopeHelper();
        req.scope = scopeHelper.extractScope(req.body.scope, client.scope);
        if (req.scope) {
          next();
        } else {
          res.status(400).json({ error: 'invalid_scope' });
        }
      } else {
        res.status(400).json({ error: 'invalid_grant' });
      }
    } else {
      next();
    }
  }

  /**
   * When the initial access token is issued, the client can then use the refresh token to obtain a new access
   * token. This grant type is known as refresh_token.
   * @param {Object} req    - Http request object
   * @param {Object} res    - Http response object
   * @param {Function} next - Middleware function to invoke next handler in the pipeline
   */
  function processRefreshTokenGrantType(req, res, next) {
    if (req.body.grant_type === 'refresh_token') {
      RefreshToken.findOne({ key: req.body.refresh_token, compromised: false, revoked: false })
        .then(token => {
          if (token) {
            checkForCompromisedRefreshToken(token, req.client.id)
              .then(token => {
                let scopeHelper = new ScopeHelper();
                req.scope = scopeHelper.extractScope(req.query.scope, token.scope);
                if (req.scope) {
                  next();
                } else {
                  res.redirect(303, UrlBuilder(req.query.redirect_uri, { error: 'invalid_scope' }));
                }
              })
              .catch(compromisedToken => {
                compromisedToken.compromised = true;
                return compromisedToken.save()
                  .then(_ => res.status(400).json({ error: 'invalid_grant' }));
              });
          } else {
            res.status(400).json({ error: 'invalid_grant' });
            return;
          }
        });
    } else {
      next();
    }
  }

  /**
   * The password grant type is generally viewed as an anti pattern in the OAuth community because
   * the client application is responsible for capturing the users username and password which it
   * then sends in text format along the wire, this means it can be susceptible to man in the middle
   * attacks. We will support it for a while and a transition grant type
   * @param {Object} req     - Http request object
   * @param {Object} res     - Http response object
   * @param {Function} next  - Middleware function to invoke next handler in the pipeline
   */
  function processPasswordGrantType(req, res, next) {
    const { client } = req;
    if (req.body.grant_type === 'password') {
      let userRepo = new UserRepository();
      userRepo.findByUserNameAndPassword(req.body.email, req.body.password)
        .then(_ => {
          let scopeHelper = new ScopeHelper();
          req.scope = scopeHelper.extractScope(req.body.scope, client.scope);
          if (req.scope) {
            next();
          } else {
            res.status(400).json({ error: 'invalid_scope' });
          }
        })
        .catch(_ => res.status(401).json({ error: 'invalid_grant' }));
    } else {
      next();
    }
  }

  /**
   * Checks to see if the refresh token has been compromised, we know it has been compromised if the client
   * id in the request does not match that stored in the database for the specific token
   * @param {Object} token    - Referesh token object
   * @param {string} clientId - Client id of current request
   */
  function checkForCompromisedRefreshToken(token, clientId) {
    // TODO: Is this the best way to compare mongodb ids?
    if (token.client.id.toString('hex') != clientId) {
      // Token has been compromised, as it has been used by a client on the platform illegally
      return Promise.reject(token);
    } else {
      return Promise.resolve(token);
    }
  }

  /**
   * Find the authorisation request and mark it as processed, so it can no longer
   * be used
   * @param {Object} req    - Http request object
   * @param {Object} res    - Http response object
   */
  function processAuthRequest(req, res, next) {
    AuthorisationRequest.findOne({ key: req.body.code })
      .then(authRequest => {
        authRequest.processed = true;
        authRequest.save()
          .then(authRequest => {
            req.scope = authRequest.scope; // Store the scope for reference in the controllers
            next();
          });
      })
      .catch(err => res.status(400).json({ error: err }) );
  }

  /**
   * Validates the authorisation request as we do store the code when the user
   * initially grants authority to the client. Check to make sure there is a valid request,
   * and if there is one then check to make sure the request client matches the client in the header
   * and that the request has not expired. Note the use of double equals
   * This is on purpose as in the request client is a string.
   * @param {Object} req    - Http request object
   * @param {Object} res    - Http response object
   */
  function validAuthorisationCode(req) {
    return AuthorisationRequest.findOne({ key: req.body.code, processed: false })
      .then(request => {
        if (request && request.client.toString() == req.client.id && !request.expired) {
          req.request = request;
          return Promise.resolve(true);
        } else {
          return Promise.reject(false);
        }
      })
      .catch(_ => Promise.reject(false) );
  }
};