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
  const clientQuery = client => 'client_id=' + client.clientId +
                                '&client_secret=' + client.clientSecret +
                                '&redirect_uri=' + client.redirectUri;

  /**
   * All our specs require database connectivity. This arrow function
   * is a useful utility for use in the before each cb
   */
  const dbConnect = done => {
    if (!mongoose.connection.db) {
      mongoose.connect(nconf.get('DATABASE'), done);
    } else {
      done();
    }
  };

  return {
    awsKey:           nconf.get('AWS_KEY'),
    awsSecret:        nconf.get('AWS_SECRET'),
    connectionString: nconf.get('DATABASE'),
    factory:          require('./factories/factory'),
    clientQuery:      clientQuery,
    dbConnect:        dbConnect
  };
};
