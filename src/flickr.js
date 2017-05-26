/** @flow */

import * as OAuth from "oauth";

import type {
  Try,
  Error,
  Perms,
  OauthRequestToken,
  OauthAccessToken,
  FlickrSyncConfiguration }
  from "./types";

function getOauthRef(appKey: string, appSecret: string): OAuth.OAuth {
  return new OAuth.OAuth(
    "https://www.flickr.com/services/oauth/request_token",
    "https://www.flickr.com/services/oauth/access_token",
    appKey,
    appSecret,
    "1.0A",
    "oob",
    "HMAC-SHA1",
  );
}

function getRequestToken(appKey: string, appSecret: string): Promise<Error | OauthRequestToken> {
  return new Promise(resolve => {
    const oauth = getOauthRef(appKey, appSecret);

    oauth.getOAuthRequestToken(
      (err, requestToken, requestTokenSecret, results) => {
        if (err === null)
          resolve({
            success: true,
            requestToken,
            requestTokenSecret,
            results,
          });
        else
          resolve({
            error: true,
            cause: err,
          });
      });
  });
}

function getAuthorizationURL(token: OauthRequestToken, perms: Perms): string {
  return `https://www.flickr.com/services/oauth/authorize?oauth_token=${token.requestToken}&perms=${perms}`;
}

function getAccessToken(
  appKey: string,
  appSecret: string,
  token: OauthRequestToken,
  verifier: string): Promise<Error | OauthAccessToken> {

  return new Promise(resolve => {
    const oauth = getOauthRef(appKey, appSecret);

    oauth.getOAuthAccessToken(token.requestToken, token.requestTokenSecret, verifier,
      (error, accessToken, accessTokenSecret, results) => {
        if (error !== null)
          resolve({ error: true, cause: error });
        else
          resolve({
            success: true,
            accessToken,
            accessTokenSecret,
            results
          });
      });
  });
}

function testLogin(config: FlickrSyncConfiguration): Promise<Try<void>> {
  const oauth = getOauthRef(config.appKey, config.appSecret);

  return new Promise(resolve => {
    oauth.get(
      "https://api.flickr.com/services/rest?nojsoncallback=1&format=json&method=flickr.test.login",
      config.accessToken,
      config.accessTokenSecret,
      (err, data) => {
        if (err !== null)
          resolve({ error: true, cause: err });
        else
          resolve({ success: true, value: data });
      }
    );
  });
}

export {
  getAuthorizationURL,
  getRequestToken,
  getAccessToken,
  testLogin
};
