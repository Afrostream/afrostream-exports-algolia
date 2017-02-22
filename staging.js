'use strict';

/*
 * Please use: npm run staging
 */

// RUN the dev code with NODE_ENV=staging.
process.env.NODE_ENV = 'staging';
process.env.PORT = '6004';
// App boostrap.
// no cluster, single-worker
require('./mq.js');