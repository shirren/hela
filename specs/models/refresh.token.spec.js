'use strict';

const bootstrap    = require('../bootstrap')()
  , _clearDb       = require('mocha-mongoose')(bootstrap.connectionString)
  , expect         = require('chai').expect
  , moment         = require('moment')
  , mongoose       = require('mongoose')
  , RefreshToken   = require('../../app/models/refresh.token');

describe('Refresh Token model', () => {

  beforeEach(done => {
    if (!mongoose.connection.db) {
      mongoose.connect(bootstrap.connectionString, done);
    } else {
      done();
    }
  });

  it('should be expirable', done => {
    bootstrap.factory
      .create('expired refresh token')
      .then(token => {
        expect(token.expired).to.be.true;
        done();
      })
      .catch(err => done(err));
  });

  describe('#save', () => {

    it('should set compromised to false by default', done => {
      bootstrap.factory
        .create('client')
        .then(client => {
          let token = new RefreshToken({ client: client });
          token
            .save()
            .then(token => {
              expect(token.compromised).to.be.false;
              done();
            })
            .catch(err => done(err));
        });
    });

    it('should set processed to false by default', done => {
      bootstrap.factory
        .create('client')
        .then(client => {
          let token = new RefreshToken({ client: client });
          token
            .save()
            .then(token => {
              expect(token.processed).to.be.false;
              done();
            })
            .catch(err => done(err));
        });
    });

    it('should auto generate a key', done => {
      bootstrap.factory
        .create('client')
        .then(client => {
          let token = new RefreshToken({ client: client });
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
          let token = new RefreshToken({ client: client });
          token
            .save()
            .then(token => {
              expect(token.expired).to.be.false;
              done();
            })
            .catch(err => done(err));
        });
    });

    it('should autogenerate a 60 minute expiry', done => {
      bootstrap.factory
        .create('refresh token')
        .then(token => {
          let diff = moment(token.expiry).diff(moment(Date.now()));
          expect(moment.utc(diff).format(':mm:ss')).to.equal(':59:59'); // Weird!!!
          done();
        });
    });
  });
});