'use strict';

const _bootstrap  = require('../bootstrap')()
  , ClientFilter  = require('../../app/filters/client.filter')
  , expect        = require('chai').expect;

describe('Client filter', () => {

  const clientFilter = new ClientFilter();

  it('should report false if the request is incomplete', () => {
    expect(clientFilter.clientIdPresentInBodyOrQuery({})).to.be.false;
  });

  it('should report false if the client id is neither the query string or body', () => {
    expect(clientFilter.clientIdPresentInBodyOrQuery({ body: {}, query: {} })).to.be.false;
  });

  it('should extract the id and secret from the query string in the absence of body and header', () => {
    expect(clientFilter.extractClientIdAndSecret({
      headers: {},
      query: {
        client_id: 1,
        client_secret: 2
      }
    })).to.eql({
      clientId: 1,
      clientSecret: 2
    });
  });

  it('should extract the id and secret from the body as a priority over the querystring', () => {
    expect(clientFilter.extractClientIdAndSecret({
      headers: {},
      body: { client_id: 3, client_secret: 4 },
      query: { client_id: 1, client_secret: 2 }
    })).to.eql({ clientId: 3, clientSecret: 4 });
  });

  it('should assume attack if the secret is in the auth header and the body', () => {
    expect(clientFilter.extractClientIdAndSecret({
      headers: { authorization: { client_id: 5, client_secret: 6 } },
      body: { client_id: 3, client_secret: 4 }
    })).to.eql({ clientId: undefined, clientSecret: undefined });
  });

  it('should assume attack if the secret is in the auth header and the query string', () => {
    expect(clientFilter.extractClientIdAndSecret({
      headers: { authorization: 'basic ' + new Buffer('id:secret').toString('base64') },
      body: {},
      query: { client_id: 3, client_secret: 4 }
    })).to.eql({ clientId: undefined, clientSecret: undefined });
  });

  it('should assume attack if the secret is in the auth header and the query string', () => {
    expect(clientFilter.extractClientIdAndSecret({
      headers: { authorization: 'basic ' + new Buffer('5:6').toString('base64') },
      body: {},
      query: {}
    })).to.eql({ clientId: '5', clientSecret: '6' });
  });
});