/* eslint-disable no-invalid-this */
'use strict';

const crypto = require('crypto');
const moment = require('moment');
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

let schemaOptions = {
  timestamps: true,
  collection: 'requests',
  discriminatorKey: '_type',
};

/**
 * A request tracks an authority request in the server from a particular client which we
 * track for posterity
 */
let RequestSchema = new Schema({
  clientId: {type: String, required: 'Client identifier required'},
  expiry: {type: Date, required: 'Expiry required'},
  key: {type: String, required: 'Request key required', index: true},
  query: {type: Object, required: 'Query required'},
  scope: [{type: String}],
  state: {type: String, required: 'State required'},
  processed: {type: Boolean, required: 'Processed required', default: false},
}, schemaOptions);

/**
 * Pre validate we generate a key for the request
 */
RequestSchema.pre('validate', function(next) {
  if (this.isNew && (this.key === '' || this.key === null || typeof this.key === 'undefined')) {
    this.key = crypto.randomBytes(16).toString('base64');
  }
  if (this.isNew && (this.expiry === '' || this.expiry === null || typeof this.expiry === 'undefined')) {
    this.expiry = moment(Date.now()).add(5, 'm'); // Add 5 minutes to now
  }
  next();
});

/**
 * Tells us if the object is expired or not
 */
RequestSchema.virtual('expired').get(function() {
  return moment(Date.now()).diff(this.expiry) >= 0;
});

module.exports = {
  model: mongoose.model('Request', RequestSchema),
  options: schemaOptions,
};
