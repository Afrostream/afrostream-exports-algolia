'use strict';

const Q = require('q');
const config = require('./config');
const algoliasearch = require('algoliasearch');
const client = algoliasearch(config.algolia.appId, config.algolia.apiKey);

const addObject = function (indexName, data) {
  var index = client.initIndex(process.env.NODE_ENV + '_' + indexName);
  console.log('algolia addObject ', indexName, data._id);
  data.objectID = data._id;

  return Q.ninvoke(index, 'addObject', data);
};

const saveObject = function (indexName, data) {
  var index = client.initIndex(process.env.NODE_ENV + '_' + indexName);
  console.log('algolia saveObject ', indexName, data._id);
  data.objectID = data._id;
  return Q.ninvoke(index, 'saveObject', data);
};

const partialUpdateObject = function (indexName, objectID, data) {
  var index = client.initIndex(process.env.NODE_ENV + '_' + indexName);
  console.log('algolia partialUpdateObject ', indexName, objectID);
  data.objectID = objectID;
  return Q.ninvoke(index, 'partialUpdateObject', data);
};

const deleteObjects = function (indexName, objectID) {
  var index = client.initIndex(process.env.NODE_ENV + '_' + indexName);
  console.log('algolia deleteObject ', indexName, objectID);
  return Q.ninvoke(index, 'deleteObjects', objectID);
};

module.exports.addObject = addObject;
module.exports.saveObject = saveObject;
module.exports.partialUpdateObject = partialUpdateObject;
module.exports.deleteObjects = deleteObjects;
