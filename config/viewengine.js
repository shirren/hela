'use strict';

const exphbs = require('express-handlebars');

/**
 * Configuration module for Handlebars.
 */
class ViewEngine {

  constructor(app) {
    this.app = app;
  }

  /**
   * Configure handle bars as the express apps view engine
   */
  configure() {
    let hbs = exphbs.create(this.configuration());
    this.app.engine('.hbs', hbs.engine);
    this.app.set('views', './app/views');
    this.app.set('view engine', '.hbs');

    // Set view caching to true for all envs except development
    if (this.app.get('env') !== 'development') {
      this.app.set('view cache', true);
    }
  }

  /**
   * Setup Handlebars at the default view engine, with the default layout 'main'.
   * Handlebars helpers are added here (TODO: Move these)
   */
  configuration() {
    return {
      extname: '.hbs',
      defaultLayout: 'main',
      layoutsDir: 'app/views/layouts/',
      helpers: {
        /**
         * This helper allows us to use the {{# section }} in our hbs
         * templates to add new content
         */
        section: function(name, options) {
          if (!this._sections) {
            this._sections = {};
          }
          this._sections[name] = options.fn(this);
          return null;
        },
        route: (name, options) => this.app.namedRoutes.build(name, options),
      }
    };
  }
}

module.exports = ViewEngine;