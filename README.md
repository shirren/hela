# cloudidentity.io preview

The team at Cloud Identity built cloudidentity.io because we believe in providing a secure platform to manage user accounts and application access. We have built this application to be made accessible to all based on our experience. Security and identity management can be a complex topic, but we've decided to tackle this particular topic by building what we think is the benchmark of cloud security - "Simple & Secure".

## OAuth2

This platform is powered by version 2 of the OAuth specification. Per the spec our platform only supports authorisation requests made via the HTTP protocol only. OAuth has a few authority grant mechanisms. It is our ambition to support them all, but one has to start somewhere. In our preview version we only support the authorization code, refresh token and client credentials grant types. Refresh token is part of the authorization code grant flow. We will explain how these flows work, and how to use these flows with our platform.

### Authorization Code

In this grant flow there are usually 4 participants. The user, client, authorisation server and resource server. The flow starts with a client requesting access to a resource (at the resource server) owned by the user. The user's credentials are present on the authorisation server. Also present on the authorisation server are the client's credentials. Often the resource server will not trust the client, but it will trust the authorisation server to verify the credentials of the client. In addition the resource server will wait for the resource owner (user) to grant access to the resource owner's data at the authorisation server.

### Refresh Token

### Client Credentials
