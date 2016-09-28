"use strict";

module.exports = function(region, credentials) {
  AWS.config.region = region;
  AWS.config.credentials = credentials;

  return new Promise(function(resolve, reject) {
    AWS.config.credentials.get(function(error) {
      if (error) {
        reject(error);
      } else {
        resolve(apigClientFactory.newClient({
          accessKey: AWS.config.credentials.accessKeyId,
          secretKey: AWS.config.credentials.secretAccessKey,
          sessionToken: AWS.config.credentials.sessionToken,
          region: "us-west-2"
        }));
      }
    });
  });
};
