/* eslint-disable no-invalid-this */
'use strict';

const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const crypto = require('crypto');
require('mongoose-type-url');

/**
 * A client is a system that requires access to a protected resource via
 * the authorisation server. Clients may have multiple redirect uri's as this
 * allows the client to reuse an id and secret across multiple deployments.
 * To keep things simple for the moment, we store the scope against the client,
 * this means the scope is currently NOT reusable. This might change
 * as our understanding deepens.
 */
let schema = new Schema({
  name: {type: String, required: 'Name required', index: true},
  clientId: {type: String, required: 'Client id required', index: true, unique: true},
  clientSecret: {type: String, required: 'Secret required', index: true},
  accountId: {type: String, required: 'Account required'},
  redirectUris: [{type: mongoose.SchemaTypes.Url}],
  scope: [{type: String}],
  grantTypes: [{type: String}],
}, {
  timestamps: true,
});

/**
 * Utility method to return primary redirect Uri
 */
schema
  .virtual('redirectUri')
  .get(function() {
    if (this.redirectUris && this.redirectUris.length > 0) {
      return this.redirectUris[0];
    }
    return undefined;
  });

/**
 * Tells us if this client supports the specified grant type
 * @param {string} grantType
 * @return {boolean} true if grant is supported else false
 */
schema.methods.supportsGrant = function(grantType) {
  return this.grantTypes.includes(grantType);
};

/**
 * Pre validate we track whether the application document is new. The pre validations
 * is a piece of mongoose middleware so we need to pass execution onto the next
 * validator
 */
schema.pre('validate', function(next) {
  if (this.isNew && (this.clientId === '' || this.clientId === null || typeof this.clientId === 'undefined')) {
    this.clientId = crypto.randomBytes(32).toString('hex');
  }
  if (this.isNew && (this.clientSecret === '' || this.clientSecret === null
    || typeof this.clientSecret === 'undefined')) {
    this.clientSecret = crypto.randomBytes(64).toString('base64');
  }
  next();
});

/**
 * Client model exported for use
 */
module.exports = mongoose.model('Client', schema);
