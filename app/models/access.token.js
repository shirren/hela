'use strict';

const crypto    = require('crypto')
  , moment      = require('moment')
  , mongoose    = require('mongoose')
  , Token       = require('./schemas/token.schema');

let AccessTokenSchema = new mongoose.Schema({}, Token.schemaOptions);

/**
 * Pre validate we generate a key for the request
 */
AccessTokenSchema
  .pre('validate', function(next) {
    if (this.isNew && (this.key === '' || this.key === null || typeof this.key === 'undefined')) {
      // TODO: Store a cryptographic hash of the value in the event it is stolen.
      this.key = crypto.randomBytes(32).toString('base64');
    }
    if (this.isNew && (this.expiry === '' || this.expiry === null || typeof this.expiry === 'undefined')) {
      this.expiry = moment(Date.now()).add(10, 'm'); // Add 10 minutes to now
    }
    next();
  });

let AccessToken = Token.model.discriminator('AccessToken', AccessTokenSchema);

/**
 * Token model exported for use
 */
module.exports = AccessToken;
