'use strict';

const bootstrap          = require('../bootstrap')()
  , AuthorisationRequest = require('../../app/models/authorisation.request')
  , app                  = require('../../app')
  , _clearDb             = require('mocha-mongoose')(bootstrap.connectionString)
  , Client               = require('../../app/models/client')
  , expect               = require('chai').expect
  , moment               = require('moment')
  , mongoose             = require('mongoose')
  , AccessToken          = require('../../app/models/access.token')
  , RefreshToken         = require('../../app/models/refresh.token')
  , rest                 = require('supertest')(app);

describe('Token controller', () => {

  // Set in the beforeEach block
  let authRequest;
  let clientQuery = bootstrap.clientQuery;

  /**
   * Create the auth request for each spec to use
   */
  beforeEach(done => {
    let createAuthRequest = () => {
      bootstrap.factory
        .create('authorisation_request')
        .then(factoryObj => {
          authRequest = factoryObj;
          done();
        });
    };
    if (!mongoose.connection.db) {
      mongoose.connect(bootstrap.connectionString, createAuthRequest);
    } else {
      createAuthRequest();
    }
  });

  context('where the client does not exist', () => {

    it('should return 401 for an invalid client id', done => {
      rest.post('/token?client_id=invalid')
        .type('form').send({ 'code': authRequest.key, grant_type: 'authorization_code' })
        .expect(401, done);
    });

    it('should return 401 for a missing client id', done => {
      rest.post('/token')
        .type('form').send({ 'code': authRequest.key, grant_type: 'authorization_code' })
        .expect(401, done);
    });
  });

  context('where the client does exist', () => {

    let client, originalResponse, accessToken;

    beforeEach(done => {
      Client.findOne({ _id: authRequest.client.toString() })
        .then(result => {
          client = result;
          done();
        });
    });

    context('where the auth is 3 legged', () => {

      context('where the grant type is authorization_code', () => {

        it('should return 401 for an invalid secret', done => {
          rest.post('/token?client_id=' + client.clientId + '&client_secret=random_secret')
            .type('form').send({ 'code': authRequest.key,  grant_type: 'authorization_code' })
            .expect(401, done);
        });

        it('should return 401 for an invalid redirect uri', done => {
          rest.post('/token?client_id=' + client.clientId + '&client_secret=' + client.clientSecret + '&redirect_uri=invalid_url')
            .type('form').send({ 'code': authRequest.key, grant_type: 'authorization_code' })
            .expect(401, done);
        });

        it('should return 401 for no secret', done => {
          rest.post('/token?client_id=' + client.clientId)
            .type('form').send({ 'code': authRequest.key, grant_type: 'authorization_code' })
            .expect(401, done);
        });

        it('should invalidate the authorisation code if all security measures are met', done => {
          rest.post('/token?' + clientQuery(client))
            .type('form').send({ 'code': authRequest.key, grant_type: 'authorization_code' } )
            .expect(200)
            .then(_ => AuthorisationRequest.findOne({ _id: authRequest.id }))
            .then(authRequest => {
              expect(authRequest.processed).to.be.true;
              done();
            });
        });

        it('should generate a token if all security measures are met', done => {
          rest.post('/token?' + clientQuery(client))
            .type('form').send({ 'code': authRequest.key, grant_type: 'authorization_code' } )
            .expect(200)
            .then(_ => AccessToken.findOne({ client: client }))
            .then(token => {
              expect(token.key).to.not.be.undefined;
              done();
            });
        });

        it('should store the scope in the token if all security measures are met', done => {
          let client;
          bootstrap.factory
            .create('authorisation request with scope')
            .then(authRequest => {
              Client
                .findOne({ _id: authRequest.client.toString() })
                .then(obj => {
                  client = obj;
                  rest.post('/token?' + clientQuery(client))
                    .type('form').send({ 'code': authRequest.key, grant_type: 'authorization_code' } )
                    .expect(200)
                    .then(response => {
                      expect(response.body.scope).to.equal('read write');
                      return AccessToken.findOne({ client: client });
                    })
                    .then(accessToken => {
                      expect(accessToken.key).to.not.be.undefined;
                      expect(accessToken.scope).to.include.members(authRequest.scope);
                      return RefreshToken.findOne({ client: client });
                    })
                    .then(refreshToken => {
                      expect(refreshToken.key).to.not.be.undefined;
                      expect(refreshToken.scope).to.include.members(authRequest.scope);
                      done();
                    });
                });
            });
        });

        it('should return a token and type if all security measures are met', done => {
          rest.post('/token?' + clientQuery(client))
            .type('form').send({ 'code': authRequest.key, grant_type: 'authorization_code' } )
            .expect(200)
            .then(response => {
              originalResponse = response;
              return AccessToken.findOne({ client: client });
            })
            .then(token => {
              accessToken = token;
              return RefreshToken.findOne({ client: client });
            })
            .then(refreshToken => {
              let diff = moment(accessToken.expiry).diff(Date.now());
              expect(originalResponse.body.access_token).to.eql(accessToken.key);
              expect(originalResponse.body.refresh_token).to.eql(refreshToken.key);
              expect(originalResponse.body.token_type).to.eql('Bearer');
              expect(moment.utc(diff).format(':mm:ss')).to.equal(':09:59');
              done();
            });
        });

        it('should also accept refresh tokens to generate a new access token', done => {
          rest.post('/token?' + clientQuery(client))
            .type('form').send({ 'code': authRequest.key, grant_type: 'authorization_code' } )
            .expect(200)
            .then(response => {
              originalResponse = response;
              return rest.post('/token?' + clientQuery(client))
                .type('form').send({ 'refresh_token': response.body.refresh_token, grant_type: 'refresh_token' } )
                .expect(200);
            })
            .then(secondResponse => {
              expect(secondResponse.body.access_token).to.not.eql(originalResponse.body.access_token);
              expect(secondResponse.body.refresh_token).to.eql(originalResponse.body.refresh_token);
              expect(secondResponse.body.token_type).to.eql('Bearer');
              done();
            });
        });

        it('should also support limiting scope further when using a refresh token', done => {
          let client;
          bootstrap.factory
            .create('authorisation request with scope')
            .then(authRequest => {
              Client
                .findOne({ _id: authRequest.client.toString() })
                .then(obj => {
                  client = obj;
                  rest.post('/token?' + clientQuery(client))
                    .type('form').send({ 'code': authRequest.key, grant_type: 'authorization_code' } )
                    .expect(200)
                    .then(response => {
                      originalResponse = response;
                      expect(originalResponse.body.scope).to.eql('read write');
                      return rest.post('/token?' + clientQuery(client) + '&scope=read')
                        .type('form').send({ 'refresh_token': response.body.refresh_token, grant_type: 'refresh_token' })
                        .expect(200);
                    })
                    .then(secondResponse => {
                      expect(secondResponse.body.scope).to.eql('read');
                      done();
                    });
                });
            });
        });

        it('should not be able to re-expand the scope after initially limiting it', done => {
          let client;
          bootstrap.factory
            .create('authorisation request with scope')
            .then(authRequest => {
              Client
                .findOne({ _id: authRequest.client.toString() })
                .then(obj => {
                  client = obj;
                  rest.post('/token?' + clientQuery(client))
                    .type('form').send({ 'code': authRequest.key, grant_type: 'authorization_code' } )
                    .expect(200)
                    .then(response => {
                      originalResponse = response;
                      expect(originalResponse.body.scope).to.eql('read write');
                      return rest.post('/token?' + clientQuery(client) + '&scope=read')
                        .type('form').send({ 'refresh_token': response.body.refresh_token, grant_type: 'refresh_token' })
                        .expect(200);
                    })
                    .then(secondResponse => {
                      expect(secondResponse.body.scope).to.eql('read');
                      return rest.post('/token?' + clientQuery(client) + '&scope=read write')
                        .type('form').send({
                          'refresh_token': secondResponse.body.refresh_token, grant_type: 'refresh_token'
                        })
                        .expect(303);
                    })
                    .then(thirdResponse => {
                      expect(thirdResponse.header['location']).to.equal('http://localhost:3000/redirect_uri?error=invalid_scope');
                      done();
                    });
                });
            });
        });

        it('should pickup inconsistent scope requests on a refresh token grant type', done => {
          let client;
          bootstrap.factory
            .create('authorisation request with scope')
            .then(authRequest => {
              Client.findOne({ _id: authRequest.client.toString() })
                .then(obj => {
                  client = obj;
                  rest.post('/token?' + clientQuery(client))
                    .type('form').send({ 'code': authRequest.key, grant_type: 'authorization_code' } )
                    .expect(200)
                    .then(response => {
                      originalResponse = response;
                      expect(originalResponse.body.scope).to.eql('read write');
                      return rest.post('/token?' + clientQuery(client) + '&scope=read delete')
                        .type('form').send({ 'refresh_token': response.body.refresh_token, grant_type: 'refresh_token' })
                        .expect(303)
                        .then(response => {
                          expect(response.header['location']).to.equal('http://localhost:3000/redirect_uri?error=invalid_scope');
                          done();
                        });
                    });
                });
            });
        });

        it('should expire old access tokens when a refresh token is issued', done => {
          rest.post('/token?' + clientQuery(client))
            .type('form').send({ 'code': authRequest.key, grant_type: 'authorization_code' } )
            .expect(200)
            .then(response => {
              originalResponse = response;
              return rest.post('/token?' + clientQuery(client))
                .type('form').send({ 'refresh_token': response.body.refresh_token, grant_type: 'refresh_token' } )
                .expect(200);
            })
            .then(secondResponse => {
              expect(secondResponse.body.access_token).to.not.eql(originalResponse.body.access_token);
              expect(secondResponse.body.refresh_token).to.eql(originalResponse.body.refresh_token);
              expect(secondResponse.body.token_type).to.eql('Bearer');
              return AccessToken.findOne({ key: originalResponse.body.access_token });
            })
            .then(accessToken => {
              expect(accessToken.revoked).to.be.true;
              return RefreshToken.findOne({ key: originalResponse.body.refresh_token });
            })
            .then(refreshToken => {
              expect(refreshToken.revoked).to.be.false;
              done();
            });
        });
      });
    });

    context('where the auth is 2 legged', () => {

      context('where the grant_type is client_credentials', () => {

        it('should generate an Access token if all security measures are met', done => {
          rest.post('/token?client_id=' + client.clientId + '&client_secret=' + client.clientSecret)
            .type('form').send({ grant_type: 'client_credentials', scope: 'read' } )
            .expect(200)
            .then(_ => AccessToken.findOne({ client: client }))
            .then(token => {
              expect(token.key).to.not.be.undefined;
              done();
            });
        });

        it('should be able to reduce the requested scope', done => {
          rest.post('/token?client_id=' + client.clientId + '&client_secret=' + client.clientSecret)
            .type('form').send({ grant_type: 'client_credentials', scope: 'read' } )
            .expect(200)
            .then(response => {
              expect(response.body.scope).to.eql('read');
              done();
            });
        });

        it('should not generate a Refresh token if all security measures are met', done => {
          rest.post('/token?client_id=' + client.clientId + '&client_secret=' + client.clientSecret)
            .type('form').send({ grant_type: 'client_credentials', scope: 'read' } )
            .expect(200)
            .then(_ => RefreshToken.count({ client: client }))
            .then(count => {
              expect(count).to.equal(0);
              done();
            });
        });
      });

      context('where the grant_type is password', () => {

        it('should generate an Access token if all security measures are met', done => {
          bootstrap.factory
            .create('user')
            .then(user => {
              rest.post('/token?client_id=' + client.clientId + '&client_secret=' + client.clientSecret)
                .type('form').send({ grant_type: 'password', scope: 'read', email: user.email, password: 'password' } )
                .expect(200)
                .then(_ => AccessToken.findOne({ client: client }))
                .then(token => {
                  expect(token.key).to.not.be.undefined;
                  done();
                });
            });
        });

        it('should be able to reduce the requested scope', done => {
          bootstrap.factory
            .create('user')
            .then(user => {
              rest.post('/token?client_id=' + client.clientId + '&client_secret=' + client.clientSecret)
                .type('form').send({ grant_type: 'password', scope: 'read', email: user.email, password: 'password' } )
                .expect(200)
                .then(response => {
                  expect(response.body.scope).to.eql('read');
                  done();
                });
            });
        });

        it('should not generate a Refresh token if all secutiry measures are not met', done => {
          bootstrap.factory
            .create('user')
            .then(user => {
              rest.post('/token?client_id=' + client.clientId + '&client_secret=' + client.clientSecret)
                .type('form').send({ grant_type: 'password', scope: 'read', email: user.email, password: 'password' } )
                .expect(200)
                .then(_ => RefreshToken.count({ client: client }))
                .then(count => {
                  expect(count).to.equal(0);
                  done();
                });
            });
        });

        it('should not generate an access token for an invalid email', done => {
          bootstrap.factory
            .create('user')
            .then(_ => {
              rest.post('/token?client_id=' + client.clientId + '&client_secret=' + client.clientSecret)
                .type('form').send({ grant_type: 'password', scope: 'read', email: 'invalid', password: 'password' } )
                .expect(401)
                .then(_ => AccessToken.count({ client: client }))
                .then(count => {
                  expect(count).to.equal(0);
                  done();
                });
            });
        });

        it('should not generate an access token for an invalid password', done => {
          bootstrap.factory
            .create('user')
            .then(user => {
              rest.post('/token?client_id=' + client.clientId + '&client_secret=' + client.clientSecret)
                .type('form').send({ grant_type: 'password', scope: 'read', email: user.email, password: 'invalid' } )
                .expect(401)
                .then(_ => AccessToken.count({ client: client }))
                .then(count => {
                  expect(count).to.equal(0);
                  done();
                });
            });
        });
      });
    });
  });
});