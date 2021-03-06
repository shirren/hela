'use strict';

const moment = require('moment');
const Request = require('../../data/request');

/**
 * Factory for creating request for authority on a client application.
 * @param {Object} factory - Factory girl object
 */
module.exports = function(factory) {
  factory.define('request', Request, {
    client: factory.assoc('client', '_id'),
    query: {client_secret: 'secret'},
    state: 'randomhash',
  });

  factory.define('processed request', Request, {
    client: factory.assoc('client', '_id'),
    processed: true,
    query: {client_secret: 'secret'},
    state: 'randomhash',
  });

  factory.define('expired request', Request, {
    client: factory.assoc('client', '_id'),
    expiry: () => moment(Date.now()).add(-10, 'm').toDate(),
    query: {'test': 1},
    state: 'randomhash',
  });
};
