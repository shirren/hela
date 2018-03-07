'use strict';

/*
*  Primary entry point for the cloud identity website.
*/
const express = require('express');
const bodyParser = require('body-parser');
const nconf = require('nconf');
const app = express();
const ClientController = require('../adapters/clients-controller');
const clientRepository = require('../repositories/client-repository');
const registration = require('../ports/client-registration');

// Note how we are setting an express variable
app.set('port', nconf.get('PORT') || 3000);

/**
 * Configure the middleware
 */
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());

/**
 * Configure the applications router
 */
const clientsController = new ClientController(clientRepository(), registration());

// Client routes
app.get('/clients', (r, q) => clientsController.index(r, q));
app.post('/clients', (r, q) => clientsController.create(r, q));
app.get('/clients/:id', (r, q) => clientsController.show(r, q));
app.delete('/clients/:id', (r, q) => clientsController.destroy(r, q));

/**
 * Configure the database
 */
const Database = require('./database');
let db = new Database(app);
db.configure();

module.exports = app;
