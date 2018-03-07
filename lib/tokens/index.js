'use strict';

/**
 * Export the 'interface' of the Hela accounts module which
 * is separated into ports and adapters. Data model object
 * definitions are unaccessible except through there corresponding
 * port(s).
 */
module.exports = {
  /**
   * The key thing to note about adapters is that they can change. The
   * ports and repositories are the re-usable components
   */
  adapters: {
    AccountsController: require('./adapters/accounts-controller')
  },
  ports: {
    Registration: require('./ports/registration'),
  },
  repositories: {
    UserRepository: require('./repositories/user-repository'),
    AccountRepository: require('./repositories/account-repository'),
  },
};
