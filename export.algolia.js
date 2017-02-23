'use strict';

const Q = require('q');
const _ = require('lodash');
const config = require('./config');
const algoliasearch = require('algoliasearch');
const client = algoliasearch(config.algolia.appId, config.algolia.apiKey);

const addObject = function (indexName, data) {
  var index = client.initIndex(process.env.NODE_ENV + '_' + indexName);
  console.log('algolia addObject ', indexName, data._id);

  let indice = _.omitBy(data, _.isEmpty);
  indice.objectID = data._id;

  return Q.ninvoke(index, 'addObject', indice);
};

const saveObject = function (indexName, data) {
  var index = client.initIndex(process.env.NODE_ENV + '_' + indexName);
  console.log('algolia saveObject ', indexName, data._id);

  let indice = _.omitBy(data, _.isEmpty);
  indice.objectID = data._id;

  return Q.ninvoke(index, 'saveObject', indice);
};

const partialUpdateObject = function (indexName, objectID, data) {
  var index = client.initIndex(process.env.NODE_ENV + '_' + indexName);
  console.log('algolia partialUpdateObject ', indexName, objectID);

  let indice = _.omitBy(data, _.isEmpty);
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
