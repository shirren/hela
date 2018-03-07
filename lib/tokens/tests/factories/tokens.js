'use strict';

const moment = require('moment');
const AccessToken = require('../../data/access-token');
const RefreshToken = require('../../data/refresh-token');

/**
 * Factory for creating client applications.
 * @param {Object} factory - Factory girl object
 */
module.exports = function(factory) {
  factory.define('access token', AccessToken, {
    key: factory.seq('AccessToken.key', (n) => `key-${n}`),
    clientId: factory.seq('AccessToken.clientId', (n) => `clientid-${n}`),
  });

  factory.define('expired access token', AccessToken, {
    key: factory.seq('AccessToken.key', (n) => `key-${n}`),
    clientId: factory.seq('AccessToken.clientId', (n) => `clientid-${n}`),
    expiry: () => moment(Date.now()).add(-10, 'm').toDate(),
  });

  factory.define('refresh token', RefreshToken, {
    key: factory.seq('RefreshToken.key', (n) => `key-${n}`),
    clientId: factory.seq('RefreshToken.clientId', (n) => `clientid-${n}`),
  });

  factory.define('compromised refresh token', RefreshToken, {
    key: factory.seq('RefreshToken.key', (n) => `key-${n}`),
    clientId: factory.seq('RefreshToken.clientId', (n) => `clientid-${n}`),
    compromised: true,
  });

  factory.define('processed refresh token', RefreshToken, {
    key: factory.seq('RefreshToken.key', (n) => `key-${n}`),
    clientId: factory.seq('RefreshToken.clientId', (n) => `clientid-${n}`),
    processed: true,
  });

  factory.define('revoked refresh token', AccessToken, {
    key: factory.seq('AccessToken.key', (n) => `key-${n}`),
    clientId: factory.seq('AccessToken.clientId', (n) => `clientid-${n}`),
    revoked: true,
  });

  factory.define('expired refresh token', RefreshToken, {
    key: factory.seq('RefreshToken.key', (n) => `key-${n}`),
    clientId: factory.seq('RefreshToken.clientId', (n) => `clientid-${n}`),
    expiry: () => moment(Date.now()).add(-10, 'm').toDate(),
  });
};
