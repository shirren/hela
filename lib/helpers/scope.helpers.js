'use strict';

const __ = require('underscore');

module.exports = function() {

  return {
    scopeMismatch: scopeMismatch,
    extractScope: extractScope,
    extractRequestedScopesFromForm: extractRequestedScopesFromForm
  };

  /**
   * Check to make sure that the granted scopes by the user match those provided to the client. If they
   * do not match then we assume the user has tampered the scope
   * @param {Object} req    - Http request object
   */
  function scopeMismatch(requestScope, clientScope) {
    return __.difference(requestScope, clientScope).length > 0;
  }

  /**
   * A client will have some available scope, when the client requests a certain
   * scope, we check this against the available scope. If they do not specify any
   * scope then we assume they are requested all of it.
   * @param {string} requestedScope - string of space separated scope words
   * @param {array} availableScope  - an array of scopes
   */
  function extractScope(requestedScope, availableScope) {
    // TODO: Is it possible for a malicious client to send a malformed scope that
    // can cause Node to act weirdly?
    let scope = requestedScope ? requestedScope.split(' ') : undefined;
    if (scope) {
      if (!scopeMismatch(scope, availableScope)) {
        return scope;
      }
    } else {
      return availableScope;
    }
  }

    /**
   * Grab the requested scopes from the request body
   * @param {Object} body - Http request body
   */
  function extractRequestedScopesFromForm(body) {
    return __.filter(__.keys(body), key => key.startsWith('scope_'))
            .map(key => key.slice('scope_'.length));
  }
};