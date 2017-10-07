'use strict';

const mongoose    = require('mongoose')
  , RequestSchema = require('./schemas/request.schema');

let AuthorisationRequestSchema = new mongoose.Schema({}, RequestSchema.schemaOptions);

let AuthorisationRequest = RequestSchema.model
                              .discriminator('AuthorisationRequest', AuthorisationRequestSchema);

/**
 * Authorisation model exported for use
 */
module.exports = AuthorisationRequest;
