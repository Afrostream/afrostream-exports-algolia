'use strict';

/*
 * This file contains helper functions for ESM (Episode,Season,Movie)
 */

const backend = require('./backend.js');

const getESMFromVideo = function(videoId) {
  return backend.get({
    uri: '/api/videos/' + videoId
  }).then(video => {
    if (!video) { throw new Error(`unknown video ${videoId}`); }
    if (video.movie && video.movie.type === 'movie') {
      return getESMFromMovie(video.movie._id);
    }
    if (video.episode) {
      return getESMFromEpisode(video.episode._id);
    }
    throw new Error(`video ${videoId} is not linked to movie|episode`);
  });
};

const getESMFromEpisode = function(episodeId) {
  return backend.get({
    uri: '/api/episodes/' + episodeId
  }).then(episode => {
    if (!episode.season || !episode.season._id) { throw new Error(`missing season linked to episode ${episodeId}`); }
    return backend.get({uri: '/api/seasons/' + episode.season._id})
      .then(season => {
          if (!season.movie || !season.movie._id) { throw new Error(`missing movie linked to season ${episode.season._id}`); }
          return backend.get({uri: '/api/movies/' + season.movie._id})
            .then(movie => {
              return { episode: episode, season: season, movie: movie };
            });
      });
  });
};

const getESMFromMovie = function(movieId) {
  return backend.get({
    uri: '/api/movies/' + movieId
  }).then(movie => {
    return { episode: null, season: null, movie: movie };
  });
};

// just fetch the movie
const getESMFromSeason = function(seasonId) {
  return backend.get({
    uri: '/api/seasons/' + seasonId
  }).then(season => {
    if (!season.movie || !season.movie._id) { throw new Error(`missing movie linked to season ${season._id}`); }
    return backend.get({
      uri: '/api/movies/' + season.movie._id
    }).then(movie => {
      return { episode: null, season: season, movie: movie };
    });
  });
};


module.exports.getESMFromVideo = getESMFromVideo;
module.exports.getESMFromEpisode = getESMFromEpisode;
module.exports.getESMFromMovie = getESMFromMovie;
module.exports.getESMFromSeason = getESMFromSeason;
