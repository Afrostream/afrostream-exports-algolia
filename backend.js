'use strict';

const config = rootRequire('config');
const Client = require('afrostream-node-client-backend');

const client = new Client({
  apiKey: config.backendApiKey,
  apiSecret: config.backendApiSecret
});

module.exports = client;
