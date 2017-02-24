'use strict';

const Q = require('q');
const _ = require('lodash');
const config = require('./config');
const algoliasearch = require('algoliasearch');
const client = algoliasearch(config.algolia.appId, config.algolia.apiKey);

const filterIndice = function (data, modelId) {

  const removeEmptyObjects = function (obj) {
    return function prune (current) {
      _.forOwn(current, function (value, key) {
        if (_.isUndefined(value) || _.isNull(value) || _.isNaN(value) ||
          (_.isString(value) && _.isEmpty(value)) ||
          (_.isObject(value) && _.isEmpty(prune(value)))) {

          delete current[key];
        }
      });
      // remove any leftover undefined values from the delete
      // operation on an array
      if (_.isArray(current)) _.pull(current, undefined);

      return current;

    }(_.cloneDeep(obj));  // Do not modify the original object, create a clone instead
  };


  let indice = removeEmptyObjects(data);

  const id = modelId || (data && data.hasOwnProperty('_id') && data._id);
  if (id) {
    indice.objectID = id;
  }
  return indice;
};

const addObject = function (indexName, data) {
  var index = client.initIndex(process.env.NODE_ENV + '_' + indexName);
  console.log('algolia addObject ', indexName, data._id);

  const indice = filterIndice(data, data._id);

  return Q.ninvoke(index, 'addObject', indice);
};

const saveObject = function (indexName, data) {
  var index = client.initIndex(process.env.NODE_ENV + '_' + indexName);
  console.log('algolia saveObject ', indexName, data._id);

  const indice = filterIndice(data, data._id);

  return Q.ninvoke(index, 'saveObject', indice);
};

const partialUpdateObject = function (indexName, objectID, data) {
  var index = client.initIndex(process.env.NODE_ENV + '_' + indexName);
  console.log('algolia partialUpdateObject ', indexName, objectID);

  const indice = filterIndice(data, objectID);

  return Q.ninvoke(index, 'partialUpdateObject', indice);
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
