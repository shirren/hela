'use strict';

/*
*  Primary entry point for the cloud identity website.
*/
const express     = require('express')
  , nconf         = require('nconf')
  , app           = express();

// Note how we are setting an express variable
app.set('port', nconf.get('PORT') || 3000);
app.use(express.static(__dirname + '/public'));

/**
 * Configure handlebars as the express view engine
 */
const ViewEngine = require('./config/viewengine');
let viewEngine = new ViewEngine(app);
viewEngine.configure();

/**
 * Configure the middleware
 */
const Middleware = require('./config/middleware');
let middleware = new Middleware(app);
middleware.configure();

/**
 * Configure the applications router
 */
const Router = require('./config/router.js');
let router = new Router(app);
router.configure();

/**
 * Configure the database
 */
const Database = require('./config/database');
let db = new Database(app);
db.configure();

/**
 * Protect the api with some common patterns
 */
const helmet = require('helmet');
app.use(helmet());

module.exports = app;