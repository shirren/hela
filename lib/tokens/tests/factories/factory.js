'use strict';

const factory = require('factory-girl').factory;
const MongooseAdapter = require('factory-girl').MongooseAdapter;
const tokenFactory = require('./tokens');

/**
 * Wrapper module to define all factories
 */
module.exports = (function() {
  factory.setAdapter(new MongooseAdapter());
  tokenFactory(factory);
  return factory;
})();
