'use strict';

const expect    = require('chai').expect
  , ScopeHelper = require('../../../lib/helpers/scope.helpers');

describe('Scope helper', () => {

  let scopeHelper = new ScopeHelper();

  it('should be able to default to all the available scope', () => {
    expect(scopeHelper.extractScope('', ['read'])).to.include.members(['read']);
  });

  it('should be able to restrict scope to a subset', () => {
    expect(scopeHelper.extractScope('read write', ['read', 'write', 'delete'])).to.include.members(['read', 'write']);
  });

  it('should be able to restrict scope to a subset', () => {
    expect(scopeHelper.extractScope('read write', ['read', 'write', 'delete'])).to.include.members(['read', 'write']);
  });

  it('should return no scope if a larger set is requested', () => {
    expect(scopeHelper.extractScope('read write', ['read'])).to.be.undefined;
  });
});