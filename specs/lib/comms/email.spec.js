'use strict';

const _bootstrap  = require('../../bootstrap')()
  , Email         = require('../../../lib/comms/email')
  , expect        = require('chai').expect;

describe('Email client', () => {

  it('should be able to send a simple test email', done => {
    let email = new Email();
    email.send('shirren@me.com', 'test email', 'Hello Shirren')
      .then(data => {
        expect(data).to.not.be.undefined;
        done();
      })
      .catch(err => done(err));
  });
});