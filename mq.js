'use strict';

// exporting an instance
const config = require('./config');
const AMQP = require('afrostream-node-amqp');
const {exportIndex} = require('./export.algolia.js');
const Q = require('q');

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

      switch (type) {
        case 'model.created':
          switch (modelName) {
            case 'Movie':
              return onMovieCreated(dataValues._id);
            case 'Episode':
              return onEpisodeCreated(dataValues._id);
            default:
              break;
          }
          break;
        case 'model.updated':
          switch (modelName) {
            case 'Movie':
              return onMovieUpdated(changed, previousDataValues, dataValues);
            case 'Season':
              return onSeasonUpdated(changed, previousDataValues, dataValues);
            case 'Episode':
              return onEpisodeUpdated(changed, previousDataValues, dataValues);
            case 'Actor':
              // FIXME
              // onActorUpdated(changed, previousDataValues, dataValues);
              break;
            default:
              break;
          }
          break;
        case 'model.deleted':
          switch (modelName) {
            case 'Movie':
              // FIXME: deprovisionning.
              break;
            case 'Episode':
              // FIXME: deprovisionning.
              break;
            default:
              break;
          }
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
 * when a movie is created, we export it
 *
 * @param movieId    string
 * @return void
 * @throw errors
 */
function onMovieCreated (movieId) {
  console.log('[MQ]: onMovieCreated ' + movieId);

  return getESMFromMovie(movieId)
    .then(esm => {
      console.log(esm, movieId)
    });
}

/**
 * when an episode is created, we export it
 *   (triggers an error if no season linked to the episode or
 *     no movies linked to the season of the episode)
 *
 * @param episodeId      string
 * @return void
 * @throw errors
 */
function onEpisodeCreated (episodeId) {
  console.log('[MQ]: onEpisodeCreated ' + episodeId);

  getESMFromEpisode(episodeId)
    .then(esm => {
      console.log(episodeId)
    });
}

/**
 * when a movie is updated, we need to ingest the movie XML again
 *    if the posterId has changed we also need to ingest the images
 *
 * if the movie wasn't ever ingested, we trigger a first ingest.
 *
 * @param changed              array[string]   modified list fields
 * @param previousDataValues   object          { field : val }
 * @param dataValues           object          { field : val }
 * @return void
 * @throw errors
 */
function onMovieUpdated (changed, previousDataValues, dataValues) {
  console.log('[MQ]: onMovieUpdated ' + dataValues._id);

  return Q()
    .then(exportALG => {
      exportIndex(exportALG)
    });
}

/**
 * when a seasonNumber is updated, we need to ingest all episodes of that season
 *
 * @param changed              array[string]   modified list fields
 * @param previousDataValues   object          { field : val }
 * @param dataValues           object          { field : val }
 * @return void
 * @throw errors
 */
const {getESMFromSeason} = require('./export.esm.js');

function onSeasonUpdated (changed, previousDataValues, dataValues) {
  console.log('[MQ]: onSeasonUpdated ' + dataValues._id);

  if (changed.indexOf('seasonNumber') === -1) {
    return;
  }
  // searching all episode of the serie
  return getESMFromSeason(dataValues._id)
    .then(alreadyIngestedEpisodes => {
      console.log(dataValues)
    });
}

/**
 * when an episode is updated, we need to ingest the episodes of that season
 *
 * if the movie of that episode wasn't ever ingested, we trigger a first ingest.
 * if the episode wasn't ever ingested, we trigger a first ingest.
 *
 * @param changed              array[string]   modified list fields
 * @param previousDataValues   object          { field : val }
 * @param dataValues           object          { field : val }
 * @return void
 * @throw errors
 */
function onEpisodeUpdated (changed, previousDataValues, dataValues) {
  console.log('[MQ]: onEpisodeUpdated ' + dataValues._id);

  getESMFromEpisode(dataValues._id)
    .then(esm => {
      console.log(dataValues)
    });
}

this.listenToMessages();
