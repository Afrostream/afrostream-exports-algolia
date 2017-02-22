'use strict';

const Q = require('q');
const config = require('./config');
const algoliasearch = require('algoliasearch');
const client = algoliasearch(config.algolia.appId, config.algolia.apiKey);

const exportIndex = function (indexName, data) {
  var index = client.initIndex(indexName);
  return Q.ninvoke(index, 'saveObjects', data);
};

module.exports.exportIndex = exportIndex;
