'use strict';

const bootstrap          = require('../bootstrap')()
  , _clearDb             = require('mocha-mongoose')(bootstrap.connectionString)
  , expect               = require('chai').expect
  , moment               = require('moment')
  , mongoose             = require('mongoose')
  , AuthorisationRequest = require('../../app/models/authorisation.request');

describe('AuthorisationRequest model', () => {

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
        let request = new AuthorisationRequest({
          client: client, query: '?', state: 'randomhash', expiry: moment(Date.now()).add(-1, 'm')
        });
        expect(request.expired).to.be.true;
        done();
      })
      .catch(err => done(err));
  });

  describe('#save', () => {
    it('should autogenerate a key', done => {
      bootstrap.factory
        .create('client')
        .then(client => {
          let request = new AuthorisationRequest({ client: client, query: '?', state: 'randomhash' });
          request
            .save()
            .then(request => {
              expect(request.key).to.not.be.undefined;
              done();
            })
            .catch(err => done(err));
        });
    });

    it('should autogenerate a non expired request', done => {
      bootstrap.factory
        .create('client')
        .then(client => {
          let request = new AuthorisationRequest({ client: client, query: '?', state: 'randomhash' });
          request
            .save()
            .then(request => {
              expect(request.expired).to.be.false;
              done();
            })
            .catch(err => done(err));
        });
    });

    it('should autogenerate a 5 minute expiry', done => {
      bootstrap.factory
        .create('client')
        .then(client => {
          let request = new AuthorisationRequest({ client: client, query: '?', state: 'randomhash' });
          request
            .save()
            .then(request => {
              let diff = moment(request.expiry).diff(moment(Date.now()));
              expect(moment.utc(diff).format(':mm:ss')).to.equal(':04:59'); // Weird!!!
              done();
            })
            .catch(err => done(err));
        });
    });
  });

  describe('#validation', () => {

    it('should not be createable without a client', done => {
      let request = new AuthorisationRequest({});
      request.validate(err => {
        expect(err.errors.client.message).to.equal('Client required');
        done();
      });
    });

    it('should not be createable without a predefined state', done => {
      bootstrap.factory
        .create('client')
        .then(client => {
          let request = new AuthorisationRequest({ client: client });
          request.validate(err => {
            expect(err.errors.state.message).to.equal('State required');
            done();
          });
        });
    });
  });
});