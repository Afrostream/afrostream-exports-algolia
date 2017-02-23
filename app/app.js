'use strict';

const express = require('express');
const AfrostreamNodeApp = require('afrostream-node-app');
const config = rootRequire('config');
const routes = require('./routes.js');

const afrostreamMiddlewareError = require('afrostream-node-middleware-error');

const {basicAuth} = config;

const app = AfrostreamNodeApp.create({basicAuth: basicAuth, views: __dirname + '/views'});
//
app.use(routes);
//
app.use(afrostreamMiddlewareError);
//
module.exports = app;