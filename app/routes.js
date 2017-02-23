'use strict';

const express = require('express');
const router = express.Router();

// all routes are no-cache
router.use((req, res, next) => {
  res.noCache();
  next();
});
// opening routes
router.get('/*', require('./app.controller').index);

module.exports = router;