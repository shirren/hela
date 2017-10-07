'use strict';

const crypto    = require('crypto')
  , moment      = require('moment')
  , mongoose    = require('mongoose')
  , Token       = require('./schemas/token.schema');

let RefreshTokenSchema = new mongoose.Schema({}, Token.schemaOptions);

/**
 * Pre validate we generate a key for the request
 */
RefreshTokenSchema
  .pre('validate', function(next) {
    if (this.isNew && (this.key === '' || this.key === null || typeof this.key === 'undefined')) {
      // TODO: Store a cryptographic hash of the value in the event it is stolen.
      this.key = crypto.randomBytes(32).toString('base64');
    }
    if (this.isNew && (this.expiry === '' || this.expiry === null || typeof this.expiry === 'undefined')) {
      this.expiry = moment(Date.now()).add(60, 'm'); // Add 60 minutes to now
    }
    next();
  });

let RefreshToken = Token.model.discriminator('RefreshToken', RefreshTokenSchema);

/**
 * Token model exported for use
 */
module.exports = RefreshToken;
