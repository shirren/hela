'use strict';

const bootstrap = require('../bootstrap')();
const expect = require('chai').expect;
const Account = require('../../data/account');
require('mocha-mongoose')(bootstrap.connectionString);

describe('Account model', () => {
  let owner;

  beforeEach(bootstrap.dbConnect);

  beforeEach((done) => {
    bootstrap.factory
      .build('user')
      .then((factoryUser) => {
        owner = factoryUser;
        done();
      })
      .catch(done);
  });

  describe('#save', () => {
    it('should auto-generate an account id', (done) => {
      let account = new Account({name: 'name', owner: owner});
      account
        .save()
        .then((inst) => {
          expect(inst.accountId).not.to.be.null;
          done();
        })
        .catch(done);
    });

    it('should generate an initial access key upon creation', (done) => {
      let account = new Account({name: 'name', owner: owner});
      account
        .save()
        .then((inst) => {
          expect(inst.accessKeys).not.to.be.null;
          expect(inst.accessKeys.length).to.eq(1);
          expect(inst.accessKeys[0]).not.to.be.null;
          done();
        })
        .catch(done);
    });

    it('should generate a slug upon creation', (done) => {
      let account = new Account({name: 'name', owner: owner});
      account
        .save()
        .then((inst) => {
          expect(inst.slug).not.to.be.null;
          done();
        })
        .catch(done);
    });
  });

  describe('#validation', () => {
    it('should not be createable without a name', (done) => {
      let account = new Account({owner: owner});
      account
        .validate((err) => {
          expect(err.errors.name.message).to.equal('Name required');
          done();
        });
    });

    it('should not be createable without an owner', (done) => {
      let account = new Account({name: 'name'});
      account
        .validate((err) => {
          expect(err.errors.owner.message).to.equal('Owner required');
          done();
        });
    });
  });
});
