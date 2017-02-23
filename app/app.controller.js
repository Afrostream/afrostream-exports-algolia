'use strict';

const config = rootRequire('config');

module.exports.alive = function (req, res) {
  res.noCache();
  res.json({
    alive: true,
    workerStartDate: req.app.get('startDate'),
    workerUptime: Math.round((new Date() - req.app.get('startDate')) / 1000),
    env: process.env.NODE_ENV
  });
};

module.exports.index = function (req, res) {
  res.render('index.html', {
    config: JSON.stringify({})
  });
};