'use strict';

// exporting an instance
const Q = require('q');
const config = require('./config');
const AMQP = require('afrostream-node-amqp');
const {addObject, saveObject, deleteObjects} = require('./export.algolia.js');
const {getEntityFromType} = require('./export.api.js');


const allowedModels = [
  'LifePin',
  'Category',
  'Actor',
  'Season',
  'Episode',
  'Movie',
];

/**
 * @param message object
 * @paramExample
 * {
 *   "id":"145822535763933209",
 *   "type":"model.updated",
 *   "date":"2016-03-17T14:35:57.639Z",
 *   "data": {
 *     "modelName":"Episode",
 *     "changed": ["videoId"],
 *     "previousDataValues": {
 *       "videoId":null,
 *       "_id":2226,
 *       "title":"Ma femme, ses enfants et moi Épisode 34"
 *     },
 *     "dataValues": {
 *       "videoId":"05a6e828-6e73-41fd-8595-a8a4ea7e7142",
 *       "_id":2226,
 *       "title":"Ma femme, ses enfants et moi Épisode 34"
 *     }
 *   }
 * }
 */
function onMessage (message) {
  Q()
    .then(() => {
      const {
        type,
        data: {
          modelName = '',
          changed = [],
          previousDataValues = {},
          dataValues = {}
        }
      } = message;

      if (allowedModels.indexOf(modelName) === -1) {
        return console.log(`[MQ]: Model not allowed to export ${modelName}`);
      }

      switch (type) {
        case 'model.created':
          return onModelCreated(modelName, dataValues._id);
          break;
        case 'model.updated':
          return onModelUpdated(modelName, changed, previousDataValues, dataValues);
          break;
        case 'model.destroyed':
          return onModelDeleted(modelName, dataValues._id);
          break;
        default:
          break;
      }
    })
    .then(
      () => {
      },
      err => console.error(`[MQ]: error on message: ${JSON.stringify(message)}: ${err.message}`, err.stack)
    );
}

module.exports.listenToMessages = function () {
  const mq = new AMQP(config['afrostream-back-end'].mq);
  mq.on('message', onMessage);
  mq.drain({
    exchangeName: config['afrostream-back-end'].mq.exchangeName,
    queueName: config.mqQueueName
  });
  return mq;
};

/**
 * when a Model is created, we export it
 *
 * @param modelName    string
 * @param model Id    string
 * @return void
 * @throw errors
 */
function onModelCreated (modelName, modelId) {
  console.log('[MQ]: onModelCreated ' + modelName + ' id : ' + modelId);

  return getEntityFromType(modelName, modelId)
    .then(entity => {
      return addObject(modelName, entity)
    }).then(result => {
      console.log('[MQ]: onModelCreatedFromAlgolia ', modelName, modelId, result);
    });
}

/**
 * when a Model is updated, we need to ingest the model again
 *
 * @param modelName    string
 * @param changed              array[string]   modified list fields
 * @param previousDataValues   object          { field : val }
 * @param dataValues           object          { field : val }
 * @return void
 * @throw errors
 */
function onModelUpdated (modelName, changed, previousDataValues, dataValues) {
  console.log('[MQ]: onModelUpdated ' + ' ' + dataValues._id);

  return Q()
    .then(() => {
      return getEntityFromType(modelName, dataValues._id)
    })
    .then(entity => {
      return saveObject(modelName, entity)
    }).then(result => {
      console.log('[MQ]: onModelUpdatedFromAlgolia ', modelName, dataValues._id, result);
    });
}

/**
 * when a Model is deleted,remove it from algolia
 *
 * @param modelName    string
 * @param modelId    string
 * @return void
 * @throw errors
 */
function onModelDeleted (modelName, modelId) {
  console.log('[MQ]: onModelDeleted ' + ' ' + modelId);

  return Q()
    .then(() => {
      return deleteObjects(modelName, modelId)
    }).then(result => {
      console.log('[MQ]: onModelDeletedFromAlgolia ', modelName, modelId, result);
    });
}