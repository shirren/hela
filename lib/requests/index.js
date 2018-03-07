'use strict';

/**
 * Export the 'interface' of the Hela requests module which
 * is separated into ports and adapters. Data model object
 * definitions are unaccessible except through there corresponding
 * port(s).
 */
module.exports = {
  /**
   * The key thing to note about adapters is that they can change. The
   * ports and repositories are the re-usable components
   */
  ports: {
    RequestType: require('./ports/request-type'),
  },
};
