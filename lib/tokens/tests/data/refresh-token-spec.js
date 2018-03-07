'use strict';

const bootstrap = require('../bootstrap')();
const expect = require('chai').expect;
const moment = require('moment');
const RefreshToken = require('../../data/refresh-token');
require('mocha-mongoose')(bootstrap.connectionString);

describe('Refresh Token model', () => {
  const {factory} = bootstrap;
  beforeEach(bootstrap.dbConnect);

  it('should be expirable', (done) => {
    factory
      .create('expired refresh token')
      .then((token) => {
        expect(token.expired).to.be.true;
        done();
      })
      .catch(done);
  });

  describe('#save', () => {
    it('should set compromised to false by default', (done) => {
      let token = new RefreshToken({clientId: 'client-1'});
      token
        .save()
        .then((token) => {
          expect(token.compromised).to.be.false;
          done();
        })
        .catch(done);
    });

    it('should set processed to false by default', (done) => {
      let token = new RefreshToken({clientId: 'client-2'});
      token
        .save()
        .then((token) => {
          expect(token.processed).to.be.false;
          done();
        })
        .catch(done);
    });

    it('should auto generate a key', (done) => {
     let token = new RefreshToken({clientId: 'client-3' });
      token
        .save()
        .then((token) => {
          expect(token.key).to.not.be.undefined;
          done();
        })
        .catch(done);
    });

    it('should auto generate a non expired token', (done) => {
      let token = new RefreshToken({clientId: 'client-4'});
      token
        .save()
        .then((token) => {
          expect(token.expired).to.be.false;
          done();
        })
        .catch(done);
    });

    it('should autogenerate a 60 minute expiry', (done) => {
      factory
        .create('refresh token')
        .then((token) => {
          let diff = moment(token.expiry).diff(moment(Date.now()));
          expect(moment.utc(diff).format(':mm:ss')).to.equal(':59:59'); // Weird!!!
          done();
        });
    });
  });
});
