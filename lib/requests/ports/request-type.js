/* eslint-disable no-invalid-this */
'use strict';

/**
 * Uses the extractRequestType function and simply returns true for a 'Back' channel request
 * @param {Object} requestBody - http request body
 * @return {boolean} true for back channel request else false
 */
exports.isBackChannelRequest = (requestBody) => this.extractRequestType(requestBody) === 'Back';

/**
 * This function tells us if the request is via the back or front channel. A front channel
 * request is where the user is physically present and needs to provide authority. It is
 * called a front channel request because the authorisation server issues a redirect which
 * sends the user from the authorisation server back to the resource server, this redirection
 * is importantly visible to the user.
 * @param {Object} requestBody - http request body
 * @return {string} 'Back' for back channel request, 'Front' for front channel request
 */
exports.extractRequestType = function(requestBody) {
  if (requestBody.grant_type === 'client_credentials' || requestBody.grant_type === 'password') {
    return 'Back';
  } else {
    return 'Front';
  }
};
