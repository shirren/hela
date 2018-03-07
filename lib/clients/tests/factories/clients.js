'use strict';

const Client = require('../../data/client');

/**
 * Factory for creating client applications.
 * @param {Object} factory - Factory girl factory object
 */
module.exports = function(factory) {
  factory.define('client', Client, {
    name: factory.seq('Client.name', (n) => `Dummy App ${n}`),
    clientId: factory.seq('Client.clientId', (n) => `${n}2345`),
    clientSecret: 'abcdef',
    accountId: factory.seq('Client.accountId', (n) => `accountid-${n}`),
    redirectUris: ['http://localhost:3000/redirect_uri'],
    scope: ['read', 'write'],
    grantTypes: ['client_credentials'],
  });

  factory.define('client_with_no_account', Client, {
    name: factory.seq('Client.name', (n) => `Dummy App ${n}`),
    clientId: factory.seq('Client.clientId', (n) => `${n}2345`),
    clientSecret: 'abcdef',
    redirectUris: ['http://localhost:3000/redirect_uri'],
    scope: ['read', 'write'],
    grantTypes: ['client_credentials'],
  });

  factory.define('client with no grants', Client, {
    name: factory.seq('Client.name', (n) => `Dummy App ${n}`),
    clientId: factory.seq('Client.clientId', (n) => `${n}2345`),
    clientSecret: 'abcdef',
    accountId: factory.seq('Client.accountId', (n) => `accountid-${n}`),
    redirectUris: ['http://localhost:3000/redirect_uri'],
    scope: ['read', 'write'],
  });

  factory.define('client credentials client', Client, {
    name: factory.seq('Client.name', (n) => `Dummy App ${n}`),
    clientId: factory.seq('Client.clientId', (n) => `${n}2345`),
    clientSecret: 'abcdef',
    accountId: factory.seq('Client.accountId', (n) => `accountid-${n}`),
    redirectUris: ['http://localhost:3000/redirect_uri'],
    scope: ['read', 'write'],
    grantTypes: ['client_credentials'],
  });
};
