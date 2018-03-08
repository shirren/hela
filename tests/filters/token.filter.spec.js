'use strict';

const bootstrap          = require('../bootstrap')()
  , _clearDb             = require('mocha-mongoose')(bootstrap.connectionString)
  , AuthorisationRequest = require('../../app/models/authorisation.request')
  , Client               = require('../../app/models/client')
  , expect               = require('chai').expect
  , RefreshToken         = require('../../app/models/refresh.token')
  , TokenFilter          = require('../../app/filters/token.filter')
  , mongoose             = require('mongoose');

describe('Token filter', () => {

  const tokenFilter = new TokenFilter();

  beforeEach(done => {
    if (!mongoose.connection.db) {
      mongoose.connect(bootstrap.connectionString, done);
    } else {
      done();
    }
  });

  it('should catch unknown grant types', done => {
    let req = { body: { grant_type: 'unknown' } };
    let res = {
      status: (code) => {
        expect(code).to.equal(400);
        return { json: (payload) => {
          expect(payload).to.eql({ error: 'unsupported_grant_type' });
        } };
      },
    };
    tokenFilter.processAuthCodeGrantType(req, res, done);
  });

  context('authorization_code grant type', () => {

    it('should be supported', done => {
      let req = { body: { grant_type: 'authorization_code' } };
      tokenFilter.rejectUnknownGrantTypes(req, undefined, () => done());
    });

    it('should support authorization_code grant type', done => {
      bootstrap.factory
        .create('authorisation_request')
        .then(request => {
          Client
            .findOne({ _id: request.client })
            .then(client => {
              let req = { body: { grant_type: 'authorization_code', code: request.key }, client: client };
              tokenFilter.processAuthCodeGrantType(req, undefined, done);
            });
        });
    });

    it('should reject token request with no authority', (done) => {
      let req = { body: { code: 'unknown_code' } };
      tokenFilter.validAuthorisationCode(req)
        .catch(res => {
          expect(res).to.be.false;
          done();
        });
    });

    it('should reject token request with expired authority', done => {
      bootstrap.factory
        .create('expired authorisation_request')
        .then(request => {
          Client.findOne({ _id: request.client })
            .then(client => {
              let req = { body: { code: request.key }, client: client };
              tokenFilter.validAuthorisationCode(req)
                .catch(res => {
                  expect(res).to.be.false;
                  done();
                });
            });
        });
    });

    it('should reject a pre-processed authority request', done => {
      bootstrap.factory
        .create('processed authorisation_request')
        .then(request => {
          Client
            .findOne({ _id: request.client })
            .then(client => {
              let req = { body: { code: request.key }, client: client };
              tokenFilter.validAuthorisationCode(req)
                .catch(res => {
                  expect(res).to.be.false;
                  done();
                });
            });
        });
    });

    it('should reject an authority request issued to a different client', done => {
      bootstrap.factory
        .create('authorisation_request')
        .then(request => {
          bootstrap.factory
            .create('client')
            .then(client => {
              let req = { body: { code: request.key }, client: client };
              tokenFilter.validAuthorisationCode(req)
                .catch(res => {
                  expect(res).to.be.false;
                  done();
                });
            });
        });
    });

    it('should process a valid authority request', done => {
      bootstrap.factory
        .create('authorisation_request')
        .then(request => {
          return Client
            .findOne({ _id: request.client })
            .then(client => {
              let req = { body: { code: request.key }, client: client };
              return tokenFilter.validAuthorisationCode(req);
            });
        })
        .then(response => {
          expect(response).to.be.true;
          done();
        });
    });

    it('should mark a valid authority request as processed before handing to the controller', done => {
      bootstrap.factory
        .create('authorisation_request')
        .then(request => {
          let req = { body: { code: request.key } };
          tokenFilter.processAuthRequest(req, {}, () => {
            AuthorisationRequest.findOne({ _id: request.id })
              .then(authReq => {
                expect(authReq.processed).to.be.true;
                done();
              });
          });
        });
    });
  });

  context('refresh_token grant type', () => {

    it('should be supported', done => {
      let req = { body: { grant_type: 'refresh_token' } };
      tokenFilter.rejectUnknownGrantTypes(req, undefined, () => done());
    });

    it('should treat missing token as an invalid grant type', done => {
      let req = { body: { grant_type: 'refresh_token' } };
      let res = {
        status: (code) => {
          expect(code).to.equal(400);
          return { json: (payload) => {
            expect(payload).to.eql({ error: 'invalid_grant' });
            done();
          } };
        },
      };
      tokenFilter.processRefreshTokenGrantType(req, res, () => {});
    });

    it('should treat compromised tokens as an invalid grant', done => {
      bootstrap.factory
        .create('compromised refresh token')
        .then(token => {
          let req = { body: { grant_type: 'refresh_token', refresh_token: token.key } };
          let res = {
            status: (code) => {
              expect(code).to.equal(400);
              return { json: (payload) => {
                expect(payload).to.eql({ error: 'invalid_grant' });
                done();
              } };
            },
          };
          tokenFilter.processRefreshTokenGrantType(req, res, () => {});
        });
    });

    it('should treat revoked tokens as an invalid grant', done => {
      bootstrap.factory
        .create('revoked refresh token')
        .then(token => {
          let req = { body: { grant_type: 'refresh_token', refresh_token: token.key } };
          let res = {
            status: (code) => {
              expect(code).to.equal(400);
              return { json: (payload) => {
                expect(payload).to.eql({ error: 'invalid_grant' });
                done();
              } };
            },
          };
          tokenFilter.processRefreshTokenGrantType(req, res, () => {});
        });
    });

    it('should treat a valid client mismatched to the token as compromised', done => {
      bootstrap.factory
        .create('refresh token')
        .then(token => {
          bootstrap.factory
            .create('client')
            .then(client => {
              let req = { body: { grant_type: 'refresh_token', refresh_token: token.key, }, client: client };
              let res = {
                status: (code) => {
                  expect(code).to.equal(400);
                  return { json: (payload) => {
                    RefreshToken
                      .findOne({ key: token.key })
                      .then(token => {
                        expect(payload).to.eql({ error: 'invalid_grant' });
                        expect(token.compromised).to.be.true;
                        done();
                      });
                  } };
                },
              };
              return tokenFilter.processRefreshTokenGrantType(req, res, () => {});
            });
        });
    });

    it('should process a valid client matched to a token owned by it successfully', done => {
      bootstrap.factory
        .create('refresh token')
        .then(token => {
          Client
            .findOne({ _id: token.client })
            .then(client => {
              let req = { body: { grant_type: 'refresh_token', refresh_token: token.key }, client: client, query: {} };
              let res = {
                status: (code) => {
                  expect(code).to.equal(200);
                  return { json: () => {
                    RefreshToken
                      .findOne({ key: token.key })
                      .then(token => {
                        expect(token.processed).to.be.true;
                      });
                  } };
                },
              };
              return tokenFilter.processRefreshTokenGrantType(req, res, () => done());
            });
        });
    });
  });

  context('client_credentials grant type', () => {

    it('should be supported', done => {
      let req = { body: { grant_type: 'client_credentials' } };
      tokenFilter.rejectUnknownGrantTypes(req, undefined, () => done());
    });

    it('should not allow a client to request a scope it is not granted', done => {
      bootstrap.factory
        .create('client credentials client')
        .then(client => {
          let req = { client: client, body: { scope: 'read write delete', grant_type: 'client_credentials' } };
          let res = {
            status: (code) => {
              expect(code).to.equal(400);
              return { json: (payload) => {
                expect(payload).to.eql({ error: 'invalid_scope' });
                done();
              } };
            },
          };
          tokenFilter.processClientCredentialsGrantType(req, res, undefined);
        });
    });

    it('should not allow a client to use an unsupported grant type', done => {
      bootstrap.factory
        .create('client with no grants')
        .then(client => {
          // Client is not granted client_credentials grant type
          let req = { client: client, body: { scope: 'read write', grant_type: 'client_credentials' } };
          let res = {
            status: (code) => {
              expect(code).to.equal(400);
              return { json: (payload) => {
                expect(payload).to.eql({ error: 'invalid_grant' });
                done();
              } };
            },
          };
          tokenFilter.processClientCredentialsGrantType(req, res, undefined);
        });
    });
  });

  context('password grant type', () => {

    it('should be supported', done => {
      let req = { body: { grant_type: 'password' } };
      tokenFilter.rejectUnknownGrantTypes(req, undefined, () => done());
    });
  });
});