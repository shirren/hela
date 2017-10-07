'use strict';

const Client = require('../models/client')
  , Header   = require('../../lib/http/header');

/**
 *  Provides two simple filters which checks to see if a client exists
 *  as a resource on the platform
 * @constructor
 */
module.exports = function() {

  return {
    findClient: findClient,
    extractClientId: extractClientId,
    extractClientIdAndSecret: extractClientIdAndSecret,
    clientIdPresentInBodyOrQuery: clientIdPresentInBodyOrQuery
  };

  /**
   * Returns a 401 if the client was not found by a matching id and secret (pair). Only registered
   * clients are allowed to request access tokens.
   * @param {Object} req    - Http request object
   * @param {Object} res    - Http response object
   * @param {Function} next - Middleware function to invoke next handler in the pipeline
   */
  function findClient(req, res, next, query) {
    // TODO: Add a spec to make sure that a NoSQL injection is not possible
    Client.findOne(query(req))
      .then(client => {
        const { backChannelRequest } = req;
        // Only proceed if we found a client, and the redirect uri in the request
        // matches those registered against the client application
        if (client) {
          if (backChannelRequest || client.redirectUris.find(e => e === req.query.redirect_uri)) {
            req.client = client;
            next();
            return;
          }
        }
        res.status(401).json({ error: 'invalid_client' });
      });
  }

  /**
   * The client id can be grabbed from the request header, or from the query string. We always
   * check the header first, then the body and finally query string. If we find the client details
   * in the header and any place else we assume that the payload may have been tampered with
   * @param {Object} req    - Http request object
   */
  function extractClientId(req) {
    let idAndSecret = extractClientIdAndSecret(req);
    return { clientId: idAndSecret.clientId };
  }

  /**
   * The client id and secret can be grabbed from the request header, or from the query string. We always
   * check the header first, then the body and finally query string. If we find the client details
   * in the header and any place else we assume that the payload may have been tampered with.
   * TODO: Public clients should not have a secret, so we need to make this code smarter so it only
   * checks for a secret when used in the context of a public client (OAuth2)
   * @param {Object} req    - Http request object
   */
  function extractClientIdAndSecret(req) {
    const auth = req.headers['authorization'];
    if (auth) {
      if (this.clientIdPresentInBodyOrQuery(req)) {
        return { clientId: undefined, clientSecret: undefined };
      } else {
        let header = new Header();
        let credentials = header.extractIdAndSecret(auth);
        return { clientId: credentials.id, clientSecret: credentials.secret };
      }
    } else if (req.body && req.body.client_id) {
      return { clientId: req.body.client_id, clientSecret: req.body.client_secret };
    } else {
      return { clientId: req.query.client_id, clientSecret: req.query.client_secret };
    }
  }

  /**
   * Tell's us if the client id is present in either the request body or the query string. If the client id
   * is in either of those two and the authorisation header, then something funny is going on
   * @param {Object} req    - Http request object
   */
  function clientIdPresentInBodyOrQuery(req) {
    if (req.body || req.query) {
      return !!(req.body.client_id || req.query.client_id);
    }
    return false;
  }
};