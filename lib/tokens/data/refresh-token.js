/* eslint-disable no-invalid-this */
'use strict';

const moment = require('moment');
const mongoose = require('mongoose');
const TokenSchema = require('./token-schema');

const RefreshTokenSchema = new mongoose.Schema({}, TokenSchema.schemaOptions);

/**
 * Pre validate we generate a key for the request
 */
RefreshTokenSchema
  .pre('validate', function(next) {
    if (this.isNew && (this.key === '' || this.key === null || typeof this.key === 'undefined')) {
      // TODO: Store a cryptographic hash of the value in the event it is stolen.
      this.key = TokenSchema.generateKey();
    }
    if (this.isNew && (this.expiry === '' || this.expiry === null || typeof this.expiry === 'undefined')) {
      // TODO: Load this from a configurable value in the future
      this.expiry = moment(Date.now()).add(60, 'm');
    }
    next();
  });

let RefreshToken = TokenSchema.model.discriminator('RefreshToken', RefreshTokenSchema);

/**
 * Token model exported for use
 */
module.exports = RefreshToken;
