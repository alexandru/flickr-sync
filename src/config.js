/** @flow */

import * as flickr from "./flickr";
import * as utils from "./utils";
import type { Try, Error, Perms, FlickrSyncConfiguration, OauthRequestToken } from "./types";

function doIntroduction() {
  process.stdout.write("\nFlickr Sync - Config\n");
  process.stdout.write("--------------------\n\n");
  process.stdout.write("Step 1\n");
  process.stdout.write("  Create your app by going to \n");
  process.stdout.write("  https://www.flickr.com/services/apps/\n");
  process.stdout.write("  (press 'Get Another Key')\n\n");
  process.stdout.write("Step 2 - Insert the requested fields:\n\n");
}

async function authorizeUser(token: OauthRequestToken, perms: Perms): Promise<Try<string>> {
  const url = flickr.getAuthorizationURL(token, perms);

  // Opening URL in browser
  const opened = await utils.openURL(url);
  if (opened.error) return ((opened : any) : Error);

  process.stdout.write("\nStep 3 - Insert the code you got in browser window:\n\n");
  const value = await utils.askForInput("  Auth Code: ");
  return { success: true, value };
}

async function doUserDialog(perms: Perms): Promise<Error | FlickrSyncConfiguration> {
  doIntroduction();
  const appKey = await utils.askForInput("  API Key: ");
  const appSecret = await utils.askForInput("  API Secret: ");

  const rToken = await flickr.getRequestToken(appKey, appSecret);
  if (rToken.error) return ((rToken : any) : Error);

  const verifier = await authorizeUser(rToken, perms);
  if (verifier.error) return ((verifier : any) : Error);

  const aToken = await flickr.getAccessToken(appKey, appSecret, rToken, verifier.value);
  if (aToken.error) return ((aToken : any) : Error);

  return {
    success: true,
    appKey,
    appSecret,
    requestToken: rToken.requestToken,
    requestTokenSecret: rToken.requestTokenSecret,
    accessToken: aToken.accessToken,
    accessTokenSecret: aToken.accessTokenSecret,
    verifier: verifier.value,
    perms
  };
}

async function readOrGenerateConfig(): Promise<Error | FlickrSyncConfiguration> {
  const home = (process.env.HOME : ?string) || "~";
  const confPath = `${home}/.flickr-sync`;
  const existingConf = await utils.readTextFile(confPath);

  if (existingConf.error)
    return ((existingConf : any) : Error);
  else if (existingConf.value !== null) {
    const config = JSON.parse(existingConf.value || "");
    // Testing if it works
    const test = await flickr.testLogin(config);
    if (!test.error) return config;
  }

  // Generate config
  const config = await doUserDialog("write");
  if (config.error) return ((config : any) : Error);
  // Writing config on disk
  const write = await utils.writeTextToFile(confPath, JSON.stringify(config));
  if (write.error) return ((write : any) : Error);
  return config;
}

export {
  readOrGenerateConfig
};
