'use strict';

const bootstrap = require('../bootstrap')();
const expect = require('chai').expect;
const moment = require('moment');
const AccessToken = require('../../data/access-token');
require('mocha-mongoose')(bootstrap.connectionString);

describe('Access Token model', () => {
  const {factory} = bootstrap;
  beforeEach(bootstrap.dbConnect);

  it('should be expirable', (done) => {
    factory
      .create('expired access token')
      .then((token) => {
        expect(token.expired).to.be.true;
        done();
      })
      .catch(done);
  });

  describe('#save', () => {
    it('should auto generate a key', (done) => {
      let token = new AccessToken({clientId: 'client-1'});
      token
        .save()
        .then((token) => {
          expect(token.key).to.not.be.undefined;
          done();
        })
        .catch(done);
    });

    it('should auto generate a non expired token', (done) => {
      let token = new AccessToken({clientId: 'client-2'});
      token
        .save()
        .then((token) => {
          expect(token.expired).to.be.false;
          done();
        })
        .catch(done);
    });

    it('should autogenerate a 10 minute expiry', (done) => {
      factory
        .create('access token')
        .then((token) => {
          let diff = moment(token.expiry).diff(moment(Date.now()));
          expect(moment.utc(diff).format(':mm:ss')).to.equal(':09:59'); // Weird!!!
          done();
        });
    });
  });
});
