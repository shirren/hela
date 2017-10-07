'use strict';

const moment    = require('moment')
  , AuthRequest = require('../../app/models/authorisation.request');

/**
 * Factory for creating request for authority on a client application.
 */
module.exports = function(factory) {

  factory.define('authorisation_request', AuthRequest, {
    client: factory.assoc('client', '_id'),
    query:  { client_secret: 'secret' },
    state: 'randomhash'
  });

  factory.define('authorisation request with scope', AuthRequest, {
    client: factory.assoc('client', '_id'),
    query:  { client_secret: 'secret' },
    scope:  ['read', 'write'],
    state: 'randomhash'
  });

  factory.define('processed authorisation_request', AuthRequest, {
    client:    factory.assoc('client', '_id'),
    processed: true,
    query:     { client_secret: 'secret' },
    state:     'randomhash'
  });

  factory.define('expired authorisation_request', AuthRequest, {
    client: factory.assoc('client', '_id'),
    expiry: () => moment(Date.now()).add(-10, 'm').toDate(),
    query:  { 'test': 1 },
    state: 'randomhash'
  });
};
