'use strict';

const User = require('../../data/user');

module.exports = function(factory) {

  factory.define('user', User, {
    firstName: factory.seq('User.firstName', n => `userf${n}`),
    lastName:  factory.seq('User.lastName',  n => `userl${n}`),
    email:     factory.seq('User.email',     n => `user+${n}@cloudidentity.io`),
    password:  'password',
    provider:  'local',
    slug:      factory.seq('User.slug', n => `slug${n}`)
  });
};
