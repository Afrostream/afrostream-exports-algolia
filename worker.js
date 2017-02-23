'use strict';

/*
 * single process, can be launched standalone
 * or inside cluster mode.
 */

// Set default node environment to development
process.env.NODE_ENV = process.env.NODE_ENV || 'development';

// global
global.__basedir = __dirname;
global.rootRequire = name => require(global.__basedir + '/' + (name[0] === '/' ? name.substr(1) : name));

// launching app.
require('./app');
