'use strict';

const _bootstrap  = require('../../bootstrap')()
  , Email         = require('../../../lib/comms/email')
  , expect        = require('chai').expect;

describe('Email client', () => {

  /**
   * Uncomment this once you've set your AWS credentials for sending emails.
   */
  it.skip('should be able to send a simple test email', done => {
    let email = new Email();
    email.send('EMAIL_ADDRESS', 'test email', 'Hello World!')
      .then(data => {
        expect(data).to.not.be.undefined;
        done();
      })
      .catch(err => done(err));
  });
});