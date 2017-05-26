/** @flow */

/**
 * For signaling errors of all kind, like the ones returned
 * by Flickr's API.
 */
export type Error = {
  error: true,
  cause: any
}

/**
 * Generic successful values.
 */
export type Success<T> = {
  success: true,
  value: T
}

/**
 * Represents a computation that may either result in an error,
 * or return a successfully computed value.
 */
export type Try<T> = Error | Success<T>

/**
 * A void return type, to be used in disjoint unions (e.g. Error | Unit).
 */
export type Unit = {
  success: true
}

/**
 * Response type for an Oauth request token, as part of
 * the authentication / authorization process.
 */
export type OauthRequestToken = {
  success: true,
  requestToken: string,
  requestTokenSecret: string,
  results: any
}

/**
 * Response type for an Oauth access token, as part of
 * the authentication / authorization process.
 */
export type OauthAccessToken = {
  success: true,
  accessToken: string,
  accessTokenSecret: string,
  results: any
}

/**
 * Possible authorization permissions.
 */
export type Perms = "read" | "write" | "delete";

/**
 * Includes everything required to make requests.
 */
export type FlickrSyncConfiguration = {
  success: true,
  appKey: string,
  appSecret: string,
  requestToken: string,
  requestTokenSecret: string,
  accessToken: string,
  accessTokenSecret: string,
  verifier: string,
  perms: Perms
}
