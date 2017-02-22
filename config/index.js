const config = require('afrostream-node-config');

const development = require('./environment/development.js');
const test = require('./environment/test.js');
const staging = require('./environment/staging.js');
const production = require('./environment/production.js');

config.merge('development', development);
config.merge('test', test);
config.merge('staging', staging);
config.merge('production', production);

module.exports = config.get();