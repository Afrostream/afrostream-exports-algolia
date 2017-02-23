'use strict';

/*
 * This file contains helper functions for Model API
 */

const backend = require('./backend.js');

const getEntityFromType = function (modelName, entityId) {
  let route = null;
  switch (modelName) {
    case 'LifePin':
      route = 'life/pins';
      break;
    default:
      route = modelName.toLowerCase() + 's';
      break;
  }
  return getEntityFromRoute(route, entityId);
};

const getEntityFromRoute = function (route, entityId) {
  return backend.get({
    uri: '/api/' + route + '/' + entityId
  }).then(entity => {
    if (!entity || !entity._id) {
      throw new Error(`No entity found in api ${route} ${entityId}`);
    }
    return entity;
  });
};


module.exports.getEntityFromType = getEntityFromType;
