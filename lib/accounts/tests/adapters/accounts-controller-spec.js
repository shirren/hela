'use strict';

const bootstrap = require('../bootstrap')();
const app = require('../test-app');
const rest = require('supertest')(app);
require('mocha-mongoose')(bootstrap.connectionString);

describe('Accounts controller', () => {
  const {factory} = bootstrap;
  let owner;

  beforeEach(bootstrap.dbConnect);

  beforeEach((done) => {
    factory
      .build('user')
      .then((factoryUser) => {
        owner = factoryUser;
        done();
      })
      .catch(done);
  });

  describe('#create', () => {
    it('should return 500 for missing user attributes', (done) => {
      rest.post('/api/v1/accounts')
        .send({name: 'account name'})
        .expect(500, done);
    });

    it('should return 201 for successful creation', (done) => {
      rest.post('/api/v1/accounts')
        .send({
          name: 'account name',
          firstName: owner.firstName,
          lastName: owner.lastName,
          email: owner.email,
          password: owner.password,
        })
        .expect(201, done);
    });
  });

  describe('#show', () => {
    it('should return 404 for unknown account', (done) => {
      rest
        .get('/api/v1/accounts/unknownaccount')
        .expect(404, done);
    });

    it('should return 200 with account details for a known account', (done) => {
      factory
        .create('account')
        .then((account) => {
          rest
            .get(`/api/v1/accounts/${account.accountId}`)
            .expect(200, done);
        });
    });
  });
});
