'use strict';

/**
 * Our grunt process executes all the Mocha specs in a bdd flavour, and then
 * run Eslint over the code base
 * @constructor
 */
module.exports = function(grunt) {

  [
    'grunt-mocha-test',
    'grunt-eslint',
    'grunt-exec'
  ].forEach(function(task) {
    grunt.loadNpmTasks(task);
  });

  // configure plugins. Note how we specify the tdd interface for mocha.
  grunt.initConfig({
    mochaTest: {
      all: {
        options: {
          ui: 'bdd',
          timeout: 5000
        },
        src: ['specs/**/*.js']
      }
    },
    eslint: {
      app:      ['*.js', 'app/**/**/*.js'],
      specs:    ['gruntfile.js', 'specs/**/*.js'],
      options : { configFile: '.eslintrc.json' },
    }
  });

  // Register tasks. The 'default' tasks is the task that runs when
  // you just type in grunt
  grunt.registerTask('default', ['mochaTest', 'eslint']);

  // Load our specific tasks
  grunt.loadTasks('./db');
};