'use strict';

const Account = require('../../data/account');

/**
 * Factory for creating account.
 */
module.exports = function(factory) {

  factory.define('account', Account, {
    name:         factory.seq('Account.name', n => `Dummy Account ${n}`),
    accountId:    factory.seq('Account.accountId', n => `${n}2345`),
    owner:        factory.assoc('user', '_id'),
    slug:         'random-slug',
    accessKeys:   ['access_key_1']
  });
};
