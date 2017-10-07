'use strict';

const Client    = require('../models/client')
  , errorHelper = require('mongoose-error-helper').errorHelper;

/**
 * Export of generic error handling actions
 */
module.exports = function() {

  return {
    index: index, add: add, create: create, show: show, destroy: destroy 
  };
  
  /**
   * Return all the current clients.
   * @param {Object} req    - Http request object
   * @param {Object} res    - Http response object
   */
  function index(req, res) {
    Client.find({}) // TODO: Return all the clients for a particular account
      .then(clients => res.render('clients/index', { clients: clients }));
  }

  /**
   * Render the new client form
   * @param {Object} req    - Http request object
   * @param {Object} res    - Http response object
   */
  function add(req, res) {
    res.render('clients/add');
  }

  /**
   * Create the new client
   * @param {Object} req    - Http request object
   * @param {Object} res    - Http response object
   */
  function create(req, res) {
    let client = new Client({ name: req.body.name, redirectUris: [req.body.redirectUri] });
    client.save()
      .then( _ => {
        req.session.flash = { message: 'New application created' };
        res.redirect(303, '/clients');
      })
      .catch(err => {
        err = err.errmsg ? [err.errmsg] : err.errors;
        res.render('clients/add', { errors: errorHelper(err) });
      });
  }

  /**
   * Show an existing clients details, if we cannot find the client, then redirect
   * back to the list of clients page
   * @param {Object} req    - Http request object
   * @param {Object} res    - Http response object
   */
  function show(req, res) {
    Client.findOne({ slug: req.params.id })
      .then(client => {
        if (client)
          res.render('clients/show', client);
        else
          res.redirect(303, '/clients');
      });
  }

  /**
   * Remove an existing client from the system. This is an async request from the browser
   * so we send back a JSON formatted response
   * @param {Object} req    - Http request object
   * @param {Object} res    - Http response object
   */
  function destroy(req, res) {
    Client.deleteOne({ slug: req.params.id })
      .then( _ => {
        req.session.flash = { message: 'Application removed' };
        res.json({ success: true });
      });
  }
};