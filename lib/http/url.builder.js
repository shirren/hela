'use strict';

const Url = require('./url');

/**
 * A utility function for increasing the reasonability of the Url builder
 * @param {String} - The base url
 * @param {Object} - An object literal with a list of properties and values as pairs
 */
module.exports = function(base, options) {
  let url = new Url(base);
  url.build(options);
  return url.pretty;
};