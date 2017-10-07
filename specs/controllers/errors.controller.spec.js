'use strict';

const bootstrap    = require('../bootstrap')()
  , mongoose       = require('mongoose')
  , _clearDb       = require('mocha-mongoose')(bootstrap.connectionString)
  , app            = require('../../app')
  , rest           = require('supertest')(app);

describe('Errors controller', () => {

  beforeEach(done => {
    if (!mongoose.connection.db) {
      mongoose.connect(bootstrap.connectionString, done);
    } else {
      done();
    }
  });

  it('should handle missing routes', done => {
    rest.get('/unkown_route')
      .expect(404, done);
  });
});