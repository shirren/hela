'use strict';

const mongoose = require('mongoose');
const nconf = require('nconf');

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
  nconf.use('file', {file: 'config.test.json'});

  /**
   * All our specs require database connectivity. This arrow function
   * is a useful utility for use in the before each cb
   * @param {requestCallback} done - Callback for continuation of specs
   */
  const dbConnect = (done) => {
    if (!mongoose.connection.db) {
      mongoose.connect(nconf.get('DATABASE'), {useMongoClient: true}, done);
    } else {
      done();
    }
  };

  return {
    connectionString: nconf.get('DATABASE'),
    factory: require('./factories/factory'),
    dbConnect: dbConnect,
  };
};
