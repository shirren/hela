'use strict';

const mongoose    = require('mongoose')
  , RequestSchema = require('./schemas/request.schema');

let InitialRequestSchema = new mongoose.Schema({}, RequestSchema.schemaOptions);

let InitialRequest = RequestSchema.model
                      .discriminator('InitialRequest', InitialRequestSchema);

/**
 * Request model exported for use
 */
module.exports = InitialRequest;