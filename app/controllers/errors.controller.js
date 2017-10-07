'use strict';

/**
 * Export of generic error handling actions
 */
module.exports = function() {

  return {
    notAuthorised: notAuthorised,
    notFound: notFound,
    serverError: serverError
  };

  /**
   * Requests with an invalid token result in this response being generated
   * @param {Object} req    - Http request object
   * @param {Object} res    - Http response object
   */
  function notAuthorised(req, res) {
    res.status(401).json({ error: 'Unauthorised call' });
  }

  /**
   * Response for resource not found
   * @param {Object} req    - Http request object
   * @param {Object} res    - Http response object
   */
  function notFound(req, res) {
    res.status(404).json({ error: 'Resource not found' });
  }

  /**
   * Catch all error state
   * @param {Object} err     - Error object
   * @param {Object} req     - Http request object
   * @param {Object} res     - Http response object
   * @param {Function} _next - Middleware function to invoke next handler in the pipeline
   */
  function serverError(err, req, res, _next) {
    // TODO: Perhaps we need to be alerted to the issue
    console.error(err.stack);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};