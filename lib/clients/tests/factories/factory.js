'use strict';

const factory = require('factory-girl').factory;
const clientFactory = require('./clients');
const MongooseAdapter = require('factory-girl').MongooseAdapter;

/**
 * Wrapper module to define all factories
 */
module.exports = (function() {
  factory.setAdapter(new MongooseAdapter());
  clientFactory(factory);
  return factory;
})();
