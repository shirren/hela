'use strict';

const bootstrap          = require('../bootstrap')()
  , app                  = require('../../app')
  , _clearDb             = require('mocha-mongoose')(bootstrap.connectionString)
  , expect               = require('chai').expect
  , mongoose             = require('mongoose')
  , AccessToken          = require('../../app/models/access.token')
  , Client               = require('../../app/models/client')
  , Request              = require('../../app/models/request')
  , AuthorisationRequest = require('../../app/models/authorisation.request')
  , querystring          = require('querystring')
  , rest                 = require('supertest')(app);

describe('Authority controller', () => {

  let clientQuery = bootstrap.clientQuery;

  beforeEach(done => {
    if (!mongoose.connection.db) {
      mongoose.connect(bootstrap.connectionString, done);
    } else {
      done();
    }
  });

  context('where the client does not exist', () => {

    it('should return 401 for an invalid client id', done => {
      rest.get('/authorize?client_id=invalid')
        .expect(401, done);
    });

    it('should return 401 for a missing client id', done => {
      rest.get('/authorize')
        .expect(401, done);
    });
  });

  context('where the client does exist', () => {

    let client;

    beforeEach(done => {
      bootstrap.factory
        .create('client')
        .then(factoryObject => {
          client = factoryObject;
          done();
        });
    });

    it('should return 401 for an invalid secret', done => {
      rest.get('/authorize?client_id=' + client.clientId + '&client_secret=random_secret')
        .expect(401, done);
    });

    it('should return 401 for an invalid redirect uri', done => {
      rest.get('/authorize?client_id=' + client.clientId + '&client_secret=' + client.clientSecret + '&redirect_uri=invalid_url')
        .expect(401, done);
    });

    it('should return 401 for no secret', done => {
      rest.get('/authorize?client_id=' + client.clientId)
        .expect(401, done);
    });

    it('should redirect with an error if the requested scope is not supported by the client', done => {
      rest.get('/authorise?response_type=code&scope=unknown&state=random&' + clientQuery(client))
        .expect(303)
        .then(response => {
          expect(response.header['location']).to.equal('http://localhost:3000/redirect_uri?error=invalid_scope');
          done();
        });
    });

    it('should track the scope in the authorisation request', done => {
      rest.get('/authorise?response_type=code&scope=read write&state=random&' + clientQuery(client))
        .expect(200)
        .then( _ => Request.findOne({ client: client }))
        .then(request => {
          expect(request.scope).to.include.members(['read', 'write']);
          done();
        });
    });

    it('should track the state in the authorisation request', done => {
      rest.get('/authorise?response_type=code&scope=read write&state=client_state&' + clientQuery(client))
        .expect(200)
        .then( _ => Request.findOne({ client: client }))
        .then(request => {
          expect(request.state).to.equal('client_state');
          done();
        });
    });

    it('should support the english spelling for authorise', done => {
      rest.get('/authorise?response_type=code&state=random&' + clientQuery(client))
        .expect(200, done);
    });

    it('should generate a new request for the client', done => {
      rest.get('/authorise?response_type=code&state=random&' + clientQuery(client))
        .expect(200)
        .then( _ => Request.findOne({ client: client }))
        .then(request => {
          expect(request).to.not.be.undefined;
          done();
        });
    });

    context('where an auth request was not generated', () => {

      it('should return 401 for a missing request', done => {
        bootstrap.factory
          .create('request')
          .then(request => Client.findOne({ _id: request.client }))
          .then(client => {
            rest.post('/approve?response_type=code&' + clientQuery(client))
              .type('form')
              .field({ 'reqid': 'random_key' })
              .expect(401, done);
          });
      });
    });

    context('where an auth request was generated', () => {

      it('should return 401 for an expired request', done => {
        bootstrap.factory
          .create('expired request')
          .then(request => {
            Client.findOne({ _id: request.client })
              .then(client => {
                rest.post('/approve?response_type=code&' + clientQuery(client))
                  .type('form')
                  .send({ 'reqid': request.key })
                  .expect(401, done);
              });
          });
      });

      it('should return 401 for a processed request', done => {
        bootstrap.factory
          .create('processed request')
          .then(request => {
            Client.findOne({ _id: request.client })
              .then(client => {
                rest.post('/approve?response_type=code&' + clientQuery(client))
                  .type('form').send({ 'reqid': request.key })
                  .expect(401, done);
              });
          });
      });

      it('should mark a request as processed upon completion', done => {
        let request;
        bootstrap.factory
          .create('request')
          .then(factoryObj => {
            request = factoryObj;
            return Client.findOne({ _id: request.client });
          })
          .then(client => {
            return rest.post('/approve?response_type=code&' + clientQuery(client))
              .type('form').send({ 'reqid': request.key })
              .expect(303);
          })
          .then(_ => {
            Request.findOne({ key: request.key })
              .then(request => {
                expect(request.processed).to.be.true;
                done();
              });
          });
      });

      it('should not allow a request to be used twice', done => {
        let request;
        bootstrap.factory
          .create('request')
          .then(factoryObj => {
            request = factoryObj;
            return Client.findOne({ _id: request.client });
          })
          .then(client => {
            return rest.post('/approve?response_type=code&' + clientQuery(client))
              .type('form').send({ 'reqid': request.key })
              .expect(303);
          })
          .then(_ => {
            rest.post('/approve?response_type=code&' + clientQuery(client))
              .type('form').send({ 'reqid': request.key })
              .expect(401, done);
          });
      });

      it('should not allow an unknown response type', done => {
        let request;
        bootstrap.factory
          .create('request')
          .then(factoryObj => {
            request = factoryObj;
            return Client.findOne({ _id: request.client });
          })
          .then(client => {
            return rest.post('/approve?response_type=invalid&' + clientQuery(client))
              .type('form').send({ 'reqid': request.key, 'approve': true })
              .expect(303);
          })
          .then(response => {
            expect(response.header.location).to.
              equal('http://localhost:3000/redirect_uri?error=unsupported_response_type');
            done();
          });
      });

      it('should generate an authorisation request for response_type code', done => {
        let request, client;
        bootstrap.factory
          .create('request')
          .then(factoryObj => {
            request = factoryObj;
            return Client.findOne({ _id: request.client });
          })
          .then(doc => {
            client = doc;
            return rest.post('/approve?response_type=code&state=test&' + clientQuery(client))
              .type('form').send({ 'reqid': request.key, 'approve': true })
              .expect(303);
          })
          .then(response => {
            AuthorisationRequest.findOne({ client: client })
              .then(auth => {
                expect(response.header.location).to
                  .equal('http://localhost:3000/redirect_uri?code=' + encodeURIComponent(auth.key) + '&state=test');
                done();
              });
          });
      });

      it('should generate an authorisation request for response_type code and handle no state in request', done => {
        let request, client;
        bootstrap.factory
          .create('request')
          .then(factoryObj => {
            request = factoryObj;
            return Client.findOne({ _id: request.client });
          })
          .then(doc => {
            client = doc;
            return rest.post('/approve?response_type=code&' + clientQuery(client))
              .type('form').send({ 'reqid': request.key, 'approve': true })
              .expect(303);
          })
          .then(response => {
            AuthorisationRequest.findOne({ client: client })
              .then(auth => {
                expect(response.header.location).to
                  .equal('http://localhost:3000/redirect_uri?code=' + encodeURIComponent(auth.key));
                done();
              });
          });
      });

      it('should not generate an authorisation request if the requested scopes do not match', done => {
        let request, client;
        bootstrap.factory
          .create('request')
          .then(factoryObj => {
            request = factoryObj;
            return Client.findOne({ _id: request.client });
          })
          .then(doc => {
            client = doc;
            return rest.post('/approve?response_type=code&' + clientQuery(client))
              .type('form').send({
                'reqid': request.key, 'approve': true, 'scope_read': 'checked', 'scope_write': 'checked', 'scope_delete': 'checked'
              })
              .expect(303);
          })
          .then(response => {
            expect(response.header.location).to.equal('http://localhost:3000/redirect_uri?error=invalid_scope');
            done();
          });
      });

      it('should generate an authorisation request for response_type code with valid scopes in request', done => {
        let request, client;
        bootstrap.factory
          .create('request')
          .then(factoryObj => {
            request = factoryObj;
            return Client.findOne({ _id: request.client });
          })
          .then(doc => {
            client = doc;
            return rest.post('/approve?response_type=code&' + clientQuery(client))
              .type('form').send({
                'reqid': request.key, 'approve': true, 'scope_read': 'checked', 'scope_write': 'checked'
              })
              .expect(303);
          })
          .then(response => {
            AuthorisationRequest
              .findOne({ client: client })
              .then(auth => {
                expect(response.header.location).to
                  .equal('http://localhost:3000/redirect_uri?code=' + encodeURIComponent(auth.key));
                expect(auth.scope).to.include('read', 'write');
                done();
              });
          });
      });

      it('should generate a token for response_type token with valid scopes in request', done => {
        let request, client, originalResponse;
        bootstrap.factory
          .create('request')
          .then(factoryObj => {
            request = factoryObj;
            return Client.findOne({ _id: request.client });
          })
          .then(doc => {
            client = doc;
            return rest.post('/approve?response_type=token&' + clientQuery(client))
              .type('form').send({
                'reqid': request.key, 'approve': true, 'scope_read': 'checked', 'scope_write': 'checked'
              })
              .expect(303);
          })
          .then(response => {
            originalResponse = response;
            return AuthorisationRequest
              .findOne({ client: client })
              .then(auth => {
                expect(auth).to.be.null;
                return AccessToken.findOne({ client: client });
              });
          })
          .then(token => {
            let qs = querystring.parse(originalResponse.header['location'].split('?')[1]);
            expect(qs.access_token).to.equal(token.key);
            expect(qs.scope).to.equal('read write');
            expect(qs.token_type).to.equal('Bearer');
            expect(qs.expires_in).to.be.lessThan(600);
            expect(qs.expires_in).to.be.greaterThan(599);
            done();
          });
      });

      it('should generate a token for response_type token with reduced scopes in request', done => {
        let request, client, originalResponse;
        bootstrap.factory
          .create('request')
          .then(factoryObj => {
            request = factoryObj;
            return Client.findOne({ _id: request.client });
          })
          .then(doc => {
            client = doc;
            return rest.post('/approve?response_type=token&' + clientQuery(client))
              .type('form').send({ 'reqid': request.key, 'approve': true, 'scope_read': 'checked' })
              .expect(303);
          })
          .then(response => {
            originalResponse = response;
            return AuthorisationRequest
              .findOne({ client: client })
              .then(auth => {
                expect(auth).to.be.null;
                return AccessToken.findOne({ client: client });
              });
          })
          .then(token => {
            let qs = querystring.parse(originalResponse.header['location'].split('?')[1]);
            expect(qs.access_token).to.equal(token.key);
            expect(qs.scope).to.equal('read');
            expect(qs.token_type).to.equal('Bearer');
            expect(qs.expires_in).to.be.lessThan(600);
            expect(qs.expires_in).to.be.greaterThan(599);
            done();
          });
      });

      it('should tell the client if something is wrong by passing data via the front channel', done => {
        let request, client;
        bootstrap.factory
          .create('request')
          .then(factoryObj => {
            request = factoryObj;
            return Client.findOne({ _id: request.client });
          })
          .then(doc => {
            client = doc;
            return rest.post('/approve?&response_type=code&' + clientQuery(client))
              .type('form').send({ 'reqid': request.key })
              .expect(303);
          })
          .then(response => {
            expect(response.header.location).to.equal('http://localhost:3000/redirect_uri?error=access_denied');
            done();
          });
      });
    });
  });
});