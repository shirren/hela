'use strict';

const Account   = require('../../../models/account')
  , User        = require('../../../models/user')
  , errorHelper = require('mongoose-error-helper').errorHelper;

/**
 * The accounts controller is to be only consumed by the single SPA which
 * utilises this back-end
 */
class AccountsController {

  /**
   * Register a new account on the platform. To register a new account the user needs to
   * have been create already. The owning account along with other required fields should be passed
   * through in the request body.
   * @param {Object} req    - Http request object
   * @param {Object} res    - Http response object
   */
  create(req, res) {
    User
      .findOne({ slug: req.body.owner })
      .then(user => {
        let account = new Account({ name: req.body.name, owner: user });
        account.save()
          .then( _ => res.status(201).json(account))
          .catch(err => {
            err = err.errmsg ? [err.errmsg] : err.errors;
            res
              .status(500)
              .json({ errors: errorHelper(err) });
          });
      });
  }

  /**
   * Retrieve an existing account details.
   * @param {Object} req    - Http request object
   * @param {Object} res    - Http response object
   */
  show(req, res) {
    Account
      .findOne({ slug: req.params.id })
      .then(account => account ? res.json(account) : res.status(404).json(account));
  }
}

module.exports = AccountsController;