'use strict';

const bootstrap    = require('../bootstrap')()
  , _clearDb       = require('mocha-mongoose')(bootstrap.connectionString)
  , expect         = require('chai').expect
  , moment         = require('moment')
  , mongoose       = require('mongoose')
  , AccessToken    = require('../../app/models/access.token');

describe('Access Token model', () => {

  beforeEach(done => {
    if (!mongoose.connection.db) {
      mongoose.connect(bootstrap.connectionString, done);
    } else {
      done();
    }
  });

  it('should be expirable', done => {
    bootstrap.factory
      .create('expired access token')
      .then(token => {
        expect(token.expired).to.be.true;
        done();
      })
      .catch(err => done(err));
  });

  describe('#save', () => {

    it('should auto generate a key', done => {
      bootstrap.factory
        .create('client')
        .then(client => {
          let token = new AccessToken({ client: client });
          token
            .save()
            .then(token => {
              expect(token.key).to.not.be.undefined;
              done();
            })
            .catch(err => done(err));
        });
    });

    it('should auto generate a non expired token', done => {
      bootstrap.factory
        .create('client')
        .then(client => {
          let token = new AccessToken({ client: client });
          token
            .save()
            .then(token => {
              expect(token.expired).to.be.false;
              done();
            })
            .catch(err => done(err));
        });
    });

    it('should autogenerate a 10 minute expiry', done => {
      bootstrap.factory
        .create('access token')
        .then(token => {
          let diff = moment(token.expiry).diff(moment(Date.now()));
          expect(300000 - diff).to.be.lessThan(2); // 5 mins is 300000 ms.
          done();
        });
    });
  });
});