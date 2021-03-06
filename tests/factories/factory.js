'use strict';

const factory          = require('factory-girl').factory
  , authRequestFactory = require('./authorisation.requests')
  , clientFactory      = require('./clients')
  , MongooseAdapter    = require('factory-girl').MongooseAdapter
  , requestFactory     = require('./requests')
  , tokenFactory       = require('./tokens');

/**
 * Wrapper module to define all factories
 */
module.exports = (function() {
  factory.setAdapter(new MongooseAdapter());
  clientFactory(factory);
  requestFactory(factory);
  authRequestFactory(factory);
  tokenFactory(factory);
  return factory;
})();
