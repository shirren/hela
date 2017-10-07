'use strict';

const querystring = require('querystring');

/**
 * Helper class used to process the Http header
 */
class Header {

  /**
   * Method extracts the client id and secret from the request header
   */
  extractIdAndSecret(auth) {
    const header = { id: undefined, secret: undefined };
    if (auth) {
      const credentials = this._decodeHeader(auth).split(':');
      if (credentials.length == 2) {
        header['id']     = querystring.unescape(credentials[0]);
        header['secret'] = querystring.unescape(credentials[1]);
      }
    }
    return header;
  }

  /**
   * Decode authorisation data present in the request header
   */
  _decodeHeader(auth) {
    const buffer = new Buffer(auth.slice('basic '.length), 'base64');
    return buffer.toString();
  }
}

module.exports = Header;