/* eslint-disable no-invalid-this */
'use strict';

const crypto = require('crypto');
const mongoose = require('mongoose');
const slug = require('mongoose-slug-generator');
const Schema = mongoose.Schema;
const validate = require('mongoose-validator');

let UserSchema = new Schema({
  firstName: {type: String, required: 'First name required', trim: true},
  lastName: {type: String, required: 'Last name required', trim: true},
  email: {
    type: String,
    validate: validate({validator: 'isEmail', passIfEmpty: true, message: 'Email not valid'}),
    required: 'Email Address required',
    unique: 'Email taken',
    trim: true,
  },
  password: {
    type: String,
    required: 'Password required',
    minlength: [6, 'Password should be longer than 5 characters'],
  },
  confirmationToken: {type: String, required: 'Confirmation token required',
    unique: 'Confirmation token must be unique'},
  confirmedAt: {type: Date},
  salt: {type: String},
  slug: {type: String, slug: ['firstName', 'lastName'], unique: true},
  provider: {type: String, required: 'Provider is required'},
  providerId: {type: String},
  locked: {type: Boolean, default: false},
  history: [{type: Schema.Types.ObjectId, ref: 'History'}],
}, {
  timestamps: true,
});

/**
 * Add support for slugs
 */
mongoose.plugin(slug);

/**
 * Add all the virtual attributes here
 */
UserSchema.virtual('fullName').get(function() {
  return this.firstName + ' ' + this.lastName;
});

/**
 * Pre validation
 */
UserSchema.pre('validate', function(next) {
  if (this.isNew) {
    this.generateConfirmationToken();
  }
  next();
});

/**
 * When a user object is saved, we convert the raw password to a hashed version
 */
UserSchema.pre('save', function(next) {
  this.wasNew = this.isNew;
  this.setPassword();
  next();
});

/**
 * Hash the password if required
 */
UserSchema.methods.setPassword = function() {
  if (this.password && this.isModified('password')) {
    this.salt = new Buffer(crypto.randomBytes(16).toString('base64'), 'base64');
    this.password = this.hashPassword(this.password);
  }
};

/**
 * Sets the confirmation token
 */
UserSchema.methods.generateConfirmationToken = function() {
  this.confirmationToken = crypto.randomBytes(16).toString('hex');
};

/**
 * Helper to hash password
 * @param {string} password - Raw user password as entered by the user
 * @return {string} hashed password using sha512 which is also base64 encoded
 */
UserSchema.methods.hashPassword = function(password) {
  return crypto.pbkdf2Sync(password, this.salt, 10000, 64, 'sha512')
          .toString('base64');
};

/**
 * Authenticate user by comparing a hashed version of the password with the stored version
 * @param {string} password - Raw user password as entered by the user
 * @return {boolean} true if password matches else false
 */
UserSchema.methods.authenticate = function(password) {
  return this.password === this.hashPassword(password);
};

module.exports = mongoose.model('User', UserSchema);
