/* eslint-disable no-invalid-this */
'use strict';

const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const crypto = require('crypto');
require('mongoose-type-url');

/**
 * When someone wants to use the platform they need to create an account first. The account can have
 * zero or more auth keys which allow the user to interact with the API.
 */
let schema = new Schema({
  name: {type: String, required: 'Name required', index: true},
  accountId: {type: String, required: 'Account id required', index: true},
  owner: {type: Schema.ObjectId, ref: 'User', required: 'Owner required'},
  accessKeys: [{type: String}],
}, {
  timestamps: true,
});

/**
 * Pre validate we generate an account identifier for the user which should be unique. If there is a clash
 * as unlikely as it is we don't care too much.
 */
schema.pre('validate', function(next) {
  if (this.isNew && (this.accountId === '' || this.accountId === null || typeof this.accountId === 'undefined')) {
    this.accountId = crypto.randomBytes(32).toString('hex');
  }
  if (this.isNew && (typeof this.accessKeys === 'undefined' || this.accessKeys.length === 0)) {
    // When an new account is generated we provide one pre defined api key
    this.accessKeys = [crypto.randomBytes(64).toString('base64')];
  }
  next();
});

/**
 * Account model exported for use
 */
module.exports = mongoose.model('Account', schema);
