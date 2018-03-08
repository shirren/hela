'use strict';

const moment     = require('moment')
  , AccessToken  = require('../../app/models/access.token')
  , RefreshToken = require('../../app/models/refresh.token');

/**
 * Factory for creating client applications.
 */
module.exports = function(factory) {

  factory.define('access token', AccessToken, {
    client:      factory.assoc('client', '_id'),
  });

  factory.define('expired access token', AccessToken, {
    client:      factory.assoc('client', '_id'),
    expiry:      () => moment(Date.now()).add(-10, 'm').toDate(),
  });

  factory.define('refresh token', RefreshToken, {
    client:      factory.assoc('client', '_id')
  });

  factory.define('compromised refresh token', RefreshToken, {
    client:      factory.assoc('client', '_id'),
    compromised: true
  });

  factory.define('processed refresh token', RefreshToken, {
    client:    factory.assoc('client', '_id'),
    processed: true
  });

  factory.define('revoked refresh token', AccessToken, {
    client:      factory.assoc('client', '_id'),
    revoked:     true
  });

  factory.define('expired refresh token', RefreshToken, {
    client:      factory.assoc('client', '_id'),
    expiry:      () => moment(Date.now()).add(-10, 'm').toDate(),
  });
};
