'use strict';

const _bootstrap  = require('../../bootstrap')()
  , Header        = require('../../../lib/http/header')
  , expect        = require('chai').expect;

describe('Header', () => {

  let header = new Header();

  it('should be able to handle an empty auth header', () => {
    // Using eql to compare value instead of objects
    expect(header.extractIdAndSecret(undefined)).to.eql({ id: undefined, secret: undefined });
  });

  it('should be able to handle an empty string', () => {
    expect(header.extractIdAndSecret('')).to.eql({ id: undefined, secret: undefined });
  });

  it('should be able to handle a malformed header (basic)', () => {
    expect(header.extractIdAndSecret('basic')).to.eql({ id: undefined, secret: undefined });
  });

  it('should be able to handle a malformed header (Basic)', () => {
    expect(header.extractIdAndSecret('basic')).to.eql({ id: undefined, secret: undefined });
  });

  it('should be able to handle a malformed header (Basic id)', () => {
    expect(header.extractIdAndSecret('basic ' + new Buffer('id').toString('base64'))).to.eql({ id: undefined, secret: undefined });
  });

  it('should be able to handle a malformed header (Basic id:)', () => {
    expect(header.extractIdAndSecret('basic ' + new Buffer('id:').toString('base64'))).
      to.eql({ id: 'id', secret: '' });
  });

  it('should be able to handle the proper header (basic id:secret)', () => {
    expect(header.extractIdAndSecret('basic ' + new Buffer('id:secret').toString('base64'))).
      to.eql({ id: 'id', secret: 'secret' });
  });
});