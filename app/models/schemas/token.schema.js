'use strict';

const moment    = require('moment')
  , mongoose  = require('mongoose')
  , Schema    = mongoose.Schema;

/**
 * Generic and shared options for the token schema
 */
let schemaOptions = {
  timestamps: true,
  collection: 'tokens',
  discriminatorKey : '_type'
};

/**
 * A token is issued to a client which successfully authenticates on the platform. The token
 * storage is independent of it's representation.
 */
let TokenSchema = new Schema({
  key:         { type: String, required: 'Access token required', index: true },
  client:      { type: Schema.ObjectId, ref: 'Client', required: 'Client required' },
  expiry:      { type: Date, required: 'Expiry required' },
  scope:       [ { type: String }],
  compromised: { type: Boolean, required: 'Compromised required', default: false, index: true },
  processed:   { type: Boolean, required: 'Processed required', default: false, index: true },
  revoked:     { type: Boolean, required: 'Revokeable required', default: false, index: true },
}, schemaOptions);

/**
 * Tells us if the token has expired or not. Currently this works as the expiry of the token is
 * mandatory.
 */
TokenSchema
  .virtual('expired')
  .get(function() {
    return moment(Date.now()).diff(this.expiry) >= 0;
  });

/**
 * Tells us in how many seconds the relevant token expires
 */
TokenSchema
  .virtual('expiresIn')
  .get(function() {
    let diff = moment(this.expiry).diff(Date.now());
    return moment.duration(diff).asSeconds();
  });

/**
 * Token schema exported for use
 */
module.exports = {
  model: mongoose.model('Token', TokenSchema),
  options: schemaOptions
};
