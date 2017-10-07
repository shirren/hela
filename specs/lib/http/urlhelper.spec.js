'use strict';

const _bootstrap  = require('../../bootstrap')()
  , Url           = require('../../../lib/http/url')
  , expect        = require('chai').expect;

describe('Url', () => {

  it('should strip the search parameter from the url object', done => {
    let url = new Url('http://localhost?search=1');
    expect(url.raw.search).to.be.undefined;
    done();
  });

  it('should add a query parameter to the url object', done => {
    let url = new Url('http://localhost');
    expect(url.raw.query).to.not.be.undefined;
    expect(url.raw.query).to.not.equal('');
    done();
  });

  it('should add a static hash on build', done => {
    let url = new Url('http://localhost');
    url.build({}, '12345');
    expect(url.raw.hash).to.equal('12345');
    done();
  });

  it('should be able to handle an undefined options list', done => {
    let url = new Url('http://localhost');
    url.build(undefined, '12345');
    expect(url.raw.query).to.be.empty;
    done();
  });

  it('should be able to handle an empty options list', done => {
    let url = new Url('http://localhost');
    url.build({}, '12345');
    expect(url.raw.query).to.be.empty;
    done();
  });

  it('should be able to handle a single options list', done => {
    let url = new Url('http://localhost');
    url.build({ client: 12345 }, '12345');
    expect(url.raw.query).to.include.keys('client');
    done();
  });

  it('should be able to handle a single options list and present a pretty version', done => {
    let url = new Url('http://localhost');
    url.build({ client: 12345 }, '12345');
    expect(url.pretty).to.equal('http://localhost/?client=12345#12345');
    done();
  });
});