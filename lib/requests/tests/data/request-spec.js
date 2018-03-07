'use strict';

const bootstrap = require('../bootstrap')();
const expect = require('chai').expect;
const moment = require('moment');
const Request = require('../../data/request');
require('mocha-mongoose')(bootstrap.connectionString);

describe('Request model', () => {
  beforeEach(bootstrap.dbConnect);

  it('should be expirable', (done) => {
    let request = new Request({
      clientId: 'client-1',
      query: '?',
      expiry: moment(Date.now()).add(-1, 'm'),
      state: 'randomhash',
    });
    expect(request.expired).to.be.true;
    done();
  });

  describe('#save', () => {
    it('should autogenerate a key', (done) => {
      let request = new Request({clientId: 'client-2', query: '?', state: 'randomhash'});
      request
        .save()
        .then((request) => {
          expect(request.key).to.not.be.undefined;
          done();
        });
    });

    it('should autogenerate a non expired request', (done) => {
      let request = new Request({clientId: 'client-3', query: '?', state: 'randomhash'});
      request
        .save()
        .then((request) => {
          expect(request.expired).to.be.false;
          done();
        });
    });

    it('should autogenerate a 5 minute expiry', (done) => {
      let request = new Request({clientId: 'client-4', query: '?', state: 'randomhash'});
      request
        .save()
        .then((request) => {
          let diff = moment(request.expiry).diff(moment(Date.now()));
          expect(moment.utc(diff).format(':mm:ss')).to.equal(':04:59'); // Weird!!!
          done();
        });
    });
  });
});
