# OAuth2 Node Implementation

## Getting Started

To get started we need to cover off on the `OAuth` principles in use by the platform, after which we show you how to get started with the platform.

## OAuth Principles

This platform is powered by version 2 of the OAuth specification. Per the spec our platform only supports authorisation requests made via the HTTP protocol only. OAuth has a few authority grant mechanisms. It is our ambition to support them all, but one has to start somewhere. In our preview version we only support the authorization code, refresh token and client credentials grant types. Refresh token is part of the authorization code grant flow. We will explain how these flows work, and how to use these flows with our platform.

### Authorization Code

In this grant flow there are usually 4 participants. The user, client, authorisation server and resource server. The flow starts with a client requesting access to a resource (at the resource server) owned by the user. The user's credentials are present on the authorisation server. Also present on the authorisation server are the client's credentials. Often the resource server will not trust the client, but it will trust the authorisation server to verify the credentials of the client. In addition the resource server will wait for the resource owner (user) to grant access to the resource owner's data at the authorisation server. At cloudidentity.io we play the role of the authorisation server. The resource server and cloudidentity will have a trusted relationship in this setup.

### Client Credentials

With the `Authorization code` grant type we saw how there were 4 participants. With client credentials there are usually only 3 participants; client, authorisation server and resource server. With this grant type there is no user. This grant type is used when a trusted client wants to gain access to a resource on a resource server. With this grant type the flow is simpler; the client requests a `token` from the authorisation server using a secret key and password. The authorisation server then generates a unique token, this token is sent to the resource server when requesting access for a particular resource. As we use `JSON Web Tokens` (*JWT*) the resource server can check and verify the integrity of the token and permit access to the requested resource. Alternatively the resource server can ask the authorisation server to validate the `JWT`.

### Refresh Token

Refresh tokens may be used by a client to request an update to an existing token iff the user is not present. This grant type is commonly used with the *Authorization Code* grant type when a client machine requires extended access to a resource. Asking a user to continuously authenticate after the original token expires can lead to poor user experience. So the common use case is to first obtain a token using *Authorization Code*, then is about to expire and the client still requires access, rather than asking the user to authenticate a client can request an updated token. The *Refresh Token* flow is similar to the *Client Credentials* flow.