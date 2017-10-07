'use strict';

const moment  = require('moment')
  , Request   = require('../../app/models/request');

/**
 * Factory for creating request for authority on a client application.
 */
module.exports = function(factory) {

  factory.define('request', Request, {
    client: factory.assoc('client', '_id'),
    query:  { client_secret: 'secret' },
    state: 'randomhash'
  });

  factory.define('processed request', Request, {
    client:    factory.assoc('client', '_id'),
    processed: true,
    query:     { client_secret: 'secret' },
    state:     'randomhash'
  });

  factory.define('expired request', Request, {
    client: factory.assoc('client', '_id'),
    expiry: () => moment(Date.now()).add(-10, 'm').toDate(),
    query:  { 'test': 1 },
    state: 'randomhash'
  });
};
