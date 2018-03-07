'use strict';

const mongoose = require('mongoose');
const RequestSchema = require('./request-schema');

let InitialRequestSchema = new mongoose.Schema({}, RequestSchema.schemaOptions);

/**
 * Request model exported for use
 */
module.exports = RequestSchema.model
.discriminator('InitialRequest', InitialRequestSchema);
