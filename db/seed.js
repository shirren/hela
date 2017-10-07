'use strict';

const _app = require('../index')
  , mongoose = require('mongoose')
  , Client = require('../app/models/client');

module.exports = function(grunt) {

  mongoose.Promise = Promise;
  grunt.registerTask('seedApps', seedApps);

  /**
   * Seed reference data for the application
   */
  function seedApps() {
    const done = this.async();
    new Client({ name: 'juggernaut' })
      .save()
      .then(_client => {
        return new Client({ name: 'ronan' }).save();
      })
      .then(_client => {
        return new Client({ name: 'loki' }).save();
      })
      .then(_client => {
        return new Client({ name: 'deadpool' }).save();
      })
      .then(_client => done());
  }
};