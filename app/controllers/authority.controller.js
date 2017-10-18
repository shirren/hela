'use strict';

const AccessTokenBuilder    = require('../models/builders/access.token.builder')
  , AuthorisationRequest    = require('../models/authorisation.request')
  , Request                 = require('../models/request')
  , ScopeHelper             = require('../../lib/helpers/scope.helpers')
  , UrlBuilder              = require('../../lib/http/url.builder')
  , __                      = require('underscore');

/**
 * This controller is principally delegated the responsibility of validating
 * the identity of a person. It is functionally dependent on filters to perform
 * it's complete role
 */
module.exports = function() {

  return {
    authorise: authorise, approve: approve
  };

  /**
   * Primary authority route for front channel communication such as in the case
   * of which an auth code is generated prior to the token issue. If the client sends scope parameters
   * in the request, then we check the scope against the clients settings
   * @param {Object} req    - Http request object
   * @param {Object} res    - Http response object
   */
  function authorise(req, res) {
    const { client } = req;
    let scope = req.query.scope ? req.query.scope.split(' ') : undefined;
    if (scope) {
      let scopeHelper = new ScopeHelper();
      if (scopeHelper.scopeMismatch(scope, client.scope)) {
        res.redirect(303, UrlBuilder(req.query.redirect_uri, { error: 'invalid_scope' }));
        return;
      }
    }
    // Render the page where we ask the user for the required level of access
    renderAuthorityPage(req, res, client, scope);
  }

  /**
   * Handles the user authentication phase for a response_type of code. No need to check
   * whether the request exists, as the filter would have taken care of it. Also no need
   * to check if the client exists, as the filter has already verified these details for
   * us.
   * @param {Object} req    - Http request object
   * @param {Object} res    - Http response object
   */
  function approve(req, res) {
    const { client } = req;
    const scope = extractScope(req.body);
    let scopeHelper = new ScopeHelper();
    if (scopeHelper.scopeMismatch(scope, client.scope)) {
      res.redirect(303, UrlBuilder(req.query.redirect_uri, { error: 'invalid_scope' }));
    } else if (userApprovalGranted(req)) {
      generateResponse(req, res, client, scope);
    } else {
      res.redirect(303, UrlBuilder(req.query.redirect_uri, { error: 'access_denied' }));
    }
  }

  /**
   * Render the page which asks for the users authority
   * @param {Object} req    - Http request object
   * @param {Object} res    - Http response object
   */
  function renderAuthorityPage(req, res, client, scope) {
    new Request({ client: client, query: req.query, scope: scope, state: req.query.state })
          .save()
          .then(request =>
            res.render('authority/approve', { client: client, reqid: request.key, scope: scope })
          );
  }

  /**
   * Generates either an AuthCode response or a Token response. AuthCode responses are generated
   * for the authorization code grant type. Token responses are generated for the Implicit grant type.
   * This is all based on the value response_type in the query string
   * @param {object} req     - Http request object
   * @param {object} res     - Http reponse object
   * @param {object} client  - Client domain object
   * @param {array} scope    - Array of scope values
   */
  function generateResponse(req, res, client, scope) {
    if (req.query.response_type === 'code') {
      generateAuthCodeResponse(req, res);
    } else if (req.query.response_type === 'token') {
      let builder = new AccessTokenBuilder();
      client
        .invalidateOtherTokens()
        .then(_ => builder.createAccessToken(client, scope))
        .then(accessToken =>
          res.redirect(303, UrlBuilder(req.query.redirect_uri, {
            access_token: accessToken.key, expires_in: accessToken.expiresIn, scope: scope.join(' '), token_type: 'Bearer'
          }))
        );
    }
  }

  /**
   * Generate an authorisation request and send it back to the client
   * @param {Object} req    - Http request object
   * @param {Object} res    - Http response object
   */
  function generateAuthCodeResponse(req, res) {
    const request = req.request;
    const scope = extractScope(req.body);
    new AuthorisationRequest({ client: request.client, query: req.query, scope: scope, state: request.state })
          .save()
          .then(auth => res.redirect(303, UrlBuilder(req.query.redirect_uri, { code: auth.key, state: req.query.state })))
          .catch(_ => res.redirect(303, UrlBuilder(req.query.redirect_uri, { error: 'server_error' })));
  }

  /**
   * If the user auth fails or the user explicitly cancels their authorisation, then we send
   * a failure message to the client via the front channel
   * @param {Object} req    - Http request object
   */
  function userApprovalGranted(req) {
    if (req.body.approve) {
      return true;
    } else {
      return false;
    }
  }

  /**
   * Extracts the scope from the request body of the object
   * @param {object} body - Body of request object
   */
  function extractScope(body) {
    let scopeHelper = new ScopeHelper();
    return scopeHelper.extractRequestedScopesFromForm(body);
  }
};