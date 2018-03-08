'use strict';

const mongoose = require('mongoose');
const nconf    = require('nconf');

/**
 * Configure database connection for a given Express application.
 * 
 * @author Shirren Premaratne
 */
class Database {

  /**
   * Setup mongoose to use EM2015 style promises
   * 
   * @constructor
   * @param {Object} app - Express applicatio
   */
  constructor(app) {
    this.app = app;
    this.opts = { useMongoClient: true };
    mongoose.Promise = Promise;
  }

  /**
   * Configure the database by setting the mongoose connection string and options
   */
  configure() {
    mongoose.connect(nconf.get('DATABASE'), this.opts);
  }
}

module.exports = Database;
