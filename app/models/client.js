'use strict';

const mongoose  = require('mongoose')
  , Schema      = mongoose.Schema
  , _urlType    = require('mongoose-type-url')
  , slug        = require('mongoose-slug-generator')
  , crypto      = require('crypto')
  , AccessToken = require('./access.token');

/**
 * A client is a system that requires access to a protected resource via
 * the authorisation server. Clients may have multiple redirect uri's as this
 * allows the client to reuse an id and secret across multiple deployments. To keep things simple for the moment
 * we store the scope against the client, this means the scope is currently NOT reusable. This might change
 * as our understanding deepens.
 */
let schema = new Schema({
  name:         { type: String, required: 'Name required', index: true, unique: true },
  clientId:     { type: String, required: 'Client id required', index: true, unique: true },
  clientSecret: { type: String, required: 'Secret required', index: true },
  redirectUris: [{ type: mongoose.SchemaTypes.Url }],
  scope:        [{ type: String }],
  grantTypes:   [{ type: String }],
  slug:         { type: String, slug: ['name'], unique: true, index: true }
}, {
  timestamps: true
});

/**
 * Add support for slugs
 */
mongoose.plugin(slug);

/**
 * Utility method to return primary redirect Uri
 */
schema.virtual('redirectUri').get(function() {
  if (this.redirectUris && this.redirectUris.length > 0) {
    return this.redirectUris[0];
  }
  return undefined;
});

/**
 * Tells us if this client supports the specified grant type
 */
schema.methods.supportsGrant = function(grantType) {
  return this.grantTypes.includes(grantType);
};

/**
 * Invalidate all other access tokens issued to this client. Note that invalidate all types of tokens Access
 */
schema.methods.invalidateOtherTokens = function() {
  return AccessToken.update({ client: this.id }, { revoked : true }, { multi: true });
};

/**
 * A client needs to have at least a single redirect uri.
 * TODO: We need to support multiple re-direct URIS.
 */
schema.path('redirectUris')
  .validate(uris => {
    if (uris && uris.length > 0) {
      return true;
    }
    return false;
  }, 'Redirect uri required');

/**
 * Pre validate we track whether the application document is new. The pre validations
 * is a piece of mongoose middleware so we need to pass execution onto the next
 * validator
 */
schema.pre('validate', function(next) {
  if (this.isNew && (this.clientId === '' || this.clientId === null || typeof this.clientId === 'undefined')) {
    this.clientId = crypto.randomBytes(32).toString('hex');
  }
  if (this.isNew && (this.clientSecret === '' || this.clientSecret === null || typeof this.clientSecret === 'undefined')) {
    this.clientSecret = crypto.randomBytes(64).toString('base64');
  }

  // Always lower case the name of the client
  if (this.name) {
    this.name = this.name.toLowerCase();
  }
  next();
});

/**
 * Client model exported for use
 */
module.exports = mongoose.model('Client', schema);
