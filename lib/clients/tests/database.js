'use strict';

const mongoose = require('mongoose');
const nconf = require('nconf');

/**
 * Configure database connection
 * @param {Object} app - express apps
 */
function Database(app) {
  this.app = app;
  this.opts = {useMongoClient: true};
  mongoose.Promise = Promise;
}

/**
 * Configure the database by setting the mongoose connection string and options
 */
Database.prototype.configure = function() {
  mongoose.connect(nconf.get('DATABASE'), this.opts);
};

module.exports = Database;
