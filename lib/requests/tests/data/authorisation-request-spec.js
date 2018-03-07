'use strict';

const bootstrap = require('../bootstrap')();
const expect = require('chai').expect;
const moment = require('moment');
const AuthorisationRequest = require('../../data/authorisation-request');
require('mocha-mongoose')(bootstrap.connectionString);

describe('AuthorisationRequest model', () => {
  beforeEach(bootstrap.dbConnect);

  it('should be expirable', (done) => {
    let request = new AuthorisationRequest({
      clientId: 'client-1',
      query: '?',
      state: 'randomhash',
      expiry: moment(Date.now()).add(-1, 'm'),
    });
    expect(request.expired).to.be.true;
    done();
  });

  describe('#save', () => {
    it('should autogenerate a key', (done) => {
      let request = new AuthorisationRequest({clientId: 'client-2', query: '?', state: 'randomhash'});
      request
        .save()
        .then((request) => {
          expect(request.key).to.not.be.undefined;
          done();
        })
        .catch(done);
    });

    it('should autogenerate a non expired request', (done) => {
      let request = new AuthorisationRequest({clientId: 'client-3', query: '?', state: 'randomhash'});
      request
        .save()
        .then((request) => {
          expect(request.expired).to.be.false;
          done();
        })
        .catch(done);
    });

    it('should autogenerate a 5 minute expiry', (done) => {
      let request = new AuthorisationRequest({clientId: 'client-4', query: '?', state: 'randomhash'});
      request
        .save()
        .then((request) => {
          let diff = moment(request.expiry).diff(moment(Date.now()));
          expect(moment.utc(diff).format(':mm:ss')).to.equal(':04:59'); // Weird!!!
          done();
        })
        .catch(done);
    });
  });

  describe('#validation', () => {
    it('should not be createable without a client', (done) => {
      let request = new AuthorisationRequest({});
      request.validate((err) => {
        expect(err.errors.clientId.message).to.equal('Client identifier required');
        done();
      });
    });

    it('should not be createable without a predefined state', (done) => {
      let request = new AuthorisationRequest({clientId: 'client-5'});
      request.validate((err) => {
        expect(err.errors.state.message).to.equal('State required');
        done();
      });
    });
  });
});
