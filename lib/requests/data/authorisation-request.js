'use strict';

const mongoose = require('mongoose');
const RequestSchema = require('./request-schema');

let AuthorisationRequestSchema = new mongoose.Schema({}, RequestSchema.schemaOptions);

/**
 * Authorisation model exported for use
 */
module.exports = RequestSchema.model
  .discriminator('AuthorisationRequest', AuthorisationRequestSchema);
