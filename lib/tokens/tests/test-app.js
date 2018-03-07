'use strict';

/*
*  Primary entry point for the cloud identity website.
*/
const express = require('express');
const bodyParser = require('body-parser');
const nconf = require('nconf');
const app = express();

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

/**
 * Configure the database
 */
const Database = require('./database');
let db = new Database(app);
db.configure();

module.exports = app;
