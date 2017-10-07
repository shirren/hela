'use strict';

const nconf = require('nconf');
nconf
  .argv()
  .env()
  .file({ file: 'config.json' });

/**
 * Start our Node server
 */
function startServer() {
  const app = require('./app');
  app.listen(nconf.get('PORT'), function() {
    console.log(`Express started in ${app.get('env')} mode on port ${nconf.get('PORT')}`);
  });
}

/**
 * This is true if we run the script directly as node index.js
 */
if (require.main === module) {
  startServer();
} else {
  // We export our primary script as module, this allows Node to launch each script
  // in a cluster
  module.exports = startServer;
}