'use strict';

const url = require('url');

/**
 * The application constructs redirect urls. This helper class exists to help it do so
 */
class Url {

  /**
   * The Url helper takes a base url from which it constructs a url object
   * @param {String} base
   */
  constructor(base) {
    this._url = url.parse(base, true);
    delete this._url.search;
  }

  /**
   * Getter for the internal url
   */
  get raw() {
    return this._url;
  }

  /**
   * Return a nice string version of the url
   */
  get pretty() {
    return url.format(this._url);
  }

  /**
   * To the url we can add some dynamic options and a hash
   * @param {Object} options
   * @param {String} hash
   */
  build(options, hash) {
    for (let key in options) {
      if (options[key]) {
        this._url.query[key] = options[key];
      }
    }
    this._url.hash = hash;
    return this;
  }
}

module.exports = Url;