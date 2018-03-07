'use strict';

const factory          = require('factory-girl').factory
  , accountFactory     = require('./accounts')
  , userFactory        = require('./users')
  , MongooseAdapter    = require('factory-girl').MongooseAdapter;

/**
 * Wrapper module to define all factories
 */
module.exports = (function() {
  factory.setAdapter(new MongooseAdapter());
  accountFactory(factory);
  userFactory(factory);
  return factory;
})();
