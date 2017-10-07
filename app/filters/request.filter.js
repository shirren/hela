'use strict';

const Request   = require('../models/request')
  , UrlBuilder  = require('../../lib/http/url.builder');

/**
 *  Provides a filter to check if a request exists. This is used by authentication
 * process because to authenticate, a request should have existed to begin with
 * @constructor
 */
module.exports = function() {

  return {
    rejectUnknownResponseTypes: rejectUnknownResponseTypes,
    processCodeRequest: processCodeRequest
  };

  /**
   * If the response type is supported then the filter hands over control to the controller or the
   * next filter in the sequence. If this application does not support the specific response type
   * the chain is halted
   * @param {Object} req    - Http request object
   * @param {Object} res    - Http response object
   * @param {Function} next - Middleware function to invoke next handler in the pipeline
   */
  function rejectUnknownResponseTypes(req, res, next) {
    if (['code', 'token'].includes(req.query.response_type)) {
      next();
    } else {
      let url = UrlBuilder(req.query.redirect_uri, { error: 'unsupported_response_type' });
      res.redirect(303, url);
    }
  }

  /**
   * Process the request. This filter should only be used after the notAuthorised filter above
   * as it assumes the request is available
   * @param {Object} req    - Http request object
   * @param {Object} res    - Http response object
   * @param {Function} next - Middleware function to invoke next handler in the pipeline
   */
  function processCodeRequest(req, res, next) {
    Request.findOne({ key: req.body.reqid, processed: false })
      .then(request => {
        if (request && !request.expired) {
          req.request = request;
          request.processed = true;
          request.save()
            .then(_ => next())
            .catch(_ => res.status(401).json({ error: 'invalid_request' }));
        } else {
          res.status(401).json({ error: 'invalid_request' });
        }
      });
  }
};