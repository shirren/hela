'use strict';

const factory = require('factory-girl').factory;
const MongooseAdapter = require('factory-girl').MongooseAdapter;
const requestsFactory = require('./requests');
const authorisationRequestsFactory = require('./authorisation-requests');

/**
 * Wrapper module to define all factories
 */
module.exports = (function() {
  factory.setAdapter(new MongooseAdapter());
  requestsFactory(factory);
  authorisationRequestsFactory(factory);
  return factory;
})();
