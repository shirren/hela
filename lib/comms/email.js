'use strict';

const ses = require('node-ses')
  , nconf = require('nconf');

/**
 * This class is a wrapper around which ever MSA we plan to use. At present
 * the MSA we are using is Amazon SES
 */
class Email {

  /**
   * Set all the required invariants for this class. We current hard code the email
   * address this does not need to be a configurable value
   */
  constructor() {
    this.sender = 'do-not-reply@cloudidentity.io';
    this.client = ses.createClient({
      key:    nconf.get('AWS_KEY'),
      secret: nconf.get('AWS_SECRET'),
      amazon: nconf.get('AWS_SES_ZONE')
    });
  }

  /**
   * Sends a message to a recipient list with a subject and message. The original
   * SES function uses continuation passing. This function changes this to a Promise
   * for ease of use
   */
  send(recipient, subject, message) {
    return new Promise((resolve, reject) => {
      this.client.sendEmail({ to: recipient, from: this.sender, subject: subject, message: message },
      function (err, data, res) {
        if (err) {
          reject(err);
        } else {
          resolve(data, res);
        }
      });
    });
  }
}

module.exports = Email;