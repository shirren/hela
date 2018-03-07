'use strict';

const expect = require('chai').expect;
const requestType = require('../../ports/request-type');

describe('Request type', () => {
  describe('#extractRequestType', () => {
    it('should reply with Back for client credentials grant type', (done) => {
      const request = {grant_type: 'client_credentials'};
      expect(requestType.extractRequestType(request)).to.eq('Back');
      done();
    });

    it('should reply with Back for password grant type', (done) => {
      const request = {grant_type: 'password'};
      expect(requestType.extractRequestType(request)).to.eq('Back');
      done();
    });

    it('should reply with Front for auth_code grant type', (done) => {
      const request = {grant_type: 'auth_code'};
      expect(requestType.extractRequestType(request)).to.eq('Front');
      done();
    });
  });

  describe('#isBackChannelRequest', () => {
    it('should reply with true for client credentials grant type', (done) => {
      const request = {grant_type: 'client_credentials'};
      expect(requestType.isBackChannelRequest(request)).to.be.truthy;
      done();
    });

    it('should reply with false for auth_code grant type', (done) => {
      const request = {grant_type: 'auth_code'};
      expect(requestType.isBackChannelRequest(request)).to.be.falsey;
      done();
    });
  });
});
