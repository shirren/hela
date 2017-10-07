'use strict';

const bootstrap    = require('../bootstrap')()
  , _clearDb       = require('mocha-mongoose')(bootstrap.connectionString)
  , expect         = require('chai').expect
  , mongoose       = require('mongoose');

describe('User model', () => {
  let user;

  beforeEach(done => {
    if (!mongoose.connection.db) {
      mongoose.connect(bootstrap.connectionString, done);
    } else {
      done();
    }
  });

  beforeEach(done => {
    bootstrap.factory
      .build('user')
      .then(factoryUser => {
        user = factoryUser;
        done();
      })
      .catch(done);
  });

  it('should not be creatable without a first name', done => {
    user.firstName = null;
    user.validate()
      .then(() => done(new Error))
      .catch(err => {
        expect(err.errors.firstName.message).to.equal('First name required');
        done();
      });
  });

  it('should not be creatable without a last name', done => {
    user.lastName = null;
    user.validate()
      .then(() => done(new Error))
      .catch(err => {
        expect(err.errors.lastName.message).to.equal('Last name required');
        done();
      });
  });

  it('should not be creatable without a password', done => {
    user.password = null;
    user.validate()
      .then(() => done(new Error))
      .catch(err => {
        expect(err.errors.password.message).to.equal('Password required');
        done();
      });
  });

  it('should not be creatable with a short password', done => {
    user.password = 'xyz12';
    user.validate()
      .then(() => done(new Error))
      .catch(err => {
        expect(err.errors.password.message).to.equal('Password should be longer than 5 characters');
        done();
      });
  });

  it('should hash the password', done => {
    user.password = 'xyz123';
    user.save()
      .then(updatedUser => {
        expect(updatedUser.password).to.not.equal('xyz123');
        done();
      })
      .catch(done);
  });

  it('should rehash the password on password change', done => {
    user.save()
      .then(updatedUser => {
        let oldPassword = user.password;
        updatedUser.password = 'newPassword';
        updatedUser.save()
          .then(twiceUpdatedUser => {
            expect(twiceUpdatedUser.password).to.not.equal(oldPassword);
            expect(twiceUpdatedUser.password).to.not.equal('newPassword');
            done();
          });
      });
  });

  it('should not be creatable without an email', done => {
    user.email = null;
    user.validate()
      .then(() => done(new Error))
      .catch(err => {
        expect(err.errors.email.message).to.equal('Email Address required');
        done();
      });
  });

  it('should not be creatable without a valid email', done => {
    user.email = 'notvalid';
    user.validate()
      .then(() => done(new Error))
      .catch(err => {
        expect(err.errors.email.message).to.equal('Email not valid');
        done();
      });
  });

  it('should not allow duplicate emails', done => {
    user.save()
      .then(savedUser => {
        bootstrap.factory
          .create('user', { email: savedUser.email })
          .then(() => done(new Error))
          .catch(err => {
            expect(err).to.not.be.undefined;
            done();
          });
      });
  });

  it('should generate a confirmationToken', done => {
    user.save()
      .then(savedUser => {
        expect(savedUser).to.have.property('confirmationToken').and.to.exist;
        done();
      });
  });

  it('should present a user with a full name', done => {
    user.firstName = 'Pierre';
    user.lastName = 'Fermat';
    user.save()
      .then(savedUser => {
        expect(savedUser.fullName).to.equal('Pierre Fermat');
        done();
      });
  });

  it('should generate a slug', done => {
    user.save()
      .then(savedUser => {
        expect(savedUser).to.have.property('slug').and.to.exist;
        done();
      });
  });

  it('should generate unique slugs for same name', done => {
    user.save()
      .then(savedUser => {
        bootstrap.factory
          .create('user', { firstName: savedUser.firstName, lastName: savedUser.lastName })
          .then(factoryUser => {
            expect(savedUser.slug).to.not.equal(factoryUser.slug);
            done();
          });
      });
  });
});
