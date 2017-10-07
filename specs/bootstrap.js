'use strict';

const mongoose = require('mongoose')
  , nconf      = require('nconf');

/**
 * Collection of common events for setting up mocha
 * @constructor
 */
module.exports = function() {

  // Configure Mongoose to use ES6 promises
  mongoose.Promise = Promise;

  /**
   * Configure the specs to use a specific configuration file
   */
  nconf.use('file', { file: 'config.test.json' });

  /**
   * Collection of utility arrow functions
   */
  let clientQuery = client => 'client_id=' + client.clientId +
                              '&client_secret=' + client.clientSecret +
                              '&redirect_uri=' + client.redirectUri;

  return {
    awsKey:           nconf.get('AWS_KEY'),
    awsSecret:        nconf.get('AWS_SECRET'),
    connectionString: nconf.get('DATABASE'),
    factory:          require('./factories/factory'),
    clientQuery:      clientQuery
  };
};
