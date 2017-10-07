'use strict';

const bootstrap    = require('../bootstrap')()
  , _clearDb       = require('mocha-mongoose')(bootstrap.connectionString)
  , expect         = require('chai').expect
  , moment         = require('moment')
  , mongoose       = require('mongoose')
  , Request        = require('../../app/models/request');

describe('Request model', () => {

  beforeEach(done => {
    if (!mongoose.connection.db) {
      mongoose.connect(bootstrap.connectionString, done);
    } else {
      done();
    }
  });

  it('should be expirable', done => {
    bootstrap.factory
      .create('client')
      .then(client => {
        let request = new Request({
          client: client, query: '?', expiry: moment(Date.now()).add(-1, 'm'), state: 'randomhash'
        });
        expect(request.expired).to.be.true;
        done();
      });
  });

  describe('#save', () => {

    it('should autogenerate a key', done => {
      bootstrap.factory
        .create('client')
        .then(client => {
          let request = new Request({ client: client, query: '?', state: 'randomhash' });
          request
            .save()
            .then(request => {
              expect(request.key).to.not.be.undefined;
              done();
            });
        });
    });

    it('should autogenerate a non expired request', done => {
      bootstrap.factory
        .create('client')
        .then(client => {
          let request = new Request({ client: client, query: '?', state: 'randomhash' });
          request
            .save()
            .then(request => {
              expect(request.expired).to.be.false;
              done();
            });
        });
    });

    it('should autogenerate a 5 minute expiry', done => {
      bootstrap.factory
        .create('client')
        .then(client => {
          let request = new Request({ client: client, query: '?', state: 'randomhash' });
          request
            .save()
            .then(request => {
              let diff = moment(request.expiry).diff(moment(Date.now()));
              expect(moment.utc(diff).format(':mm:ss')).to.equal(':04:59'); // Weird!!!
              done();
            });
        });
    });
  });
});