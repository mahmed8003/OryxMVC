var express = require('express');
var glob = require('glob');
var path = require('path');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var compress = require('compression');
var methodOverride = require('method-override');
var flash = require('connect-flash');
var helmet = require('helmet');

module.exports = function(app, config) {
    app.set('env', config.env);
    app.set('port', config.port);

    app.set('views', path.join(config.root, './app/views'));
    app.set('view engine', 'ejs');
    // Showing stack errors
    app.set('showStackError', true);

    // Environment dependent middleware
    if (config.env === 'development') {
        // Enable logger (morgan)
        app.use(logger('dev'));
        // Disable views cache
        app.set('view cache', false);
    } else if (config.env === 'production') {
        // Enable logger (morgan)
        app.use(logger('tiny'));
        // Enable views cache
        app.locals.cache = 'memory';
    }

    // Request body parsing middleware should be above methodOverride
    app.use(bodyParser.urlencoded({
        extended: true
    }));
    app.use(bodyParser.json());
    app.use(methodOverride());
    // Enable jsonp
    app.enable('jsonp callback');
    // CookieParser should be above session
    app.use(cookieParser());
    // connect flash for flash messages
    app.use(flash());
    // Use helmet to secure Express headers
    app.use(helmet.xframe());
    app.use(helmet.xssFilter());
    app.use(helmet.nosniff());
    app.use(helmet.ienoopen());
    app.disable('x-powered-by');
    // Should be placed before express.static
    app.use(compress());
    // Setting the app router and static folder
    app.use(express.static(path.join(config.root, './public')));

    // routing to all controllers
    var routes = require(path.join(config.root, './config/routes'));

    routes.commonMiddlewares.forEach(function(middlewareName) {
        var middleware = require(path.join(config.root, './app/middlewares', middlewareName + 'Middleware'));
        app.use(middleware);
    });

    routes.routes.forEach(function(route) {
        var controller = require(path.join(config.root, './app/controllers', route.controller + 'Controller'));
        var routePath = route.route || '/';
        var action = route.action || 'index';
        var method = route.method || 'GET';

        var middlewareNames = [];
        if (route.hasOwnProperty('middlewares')) {
            middlewareNames = route.middlewares;
        }

        var middlewares = [];
        middlewareNames.forEach(function(middlewareName) {
            var middleware = require(path.join(root, './app/middlewares', middlewareName + 'Middleware'));
            middlewares.push(middleware);
        });

        if (method === 'POST') {
            app.post(routePath, middlewares, controller[action]);
        } else if (method === 'PUT') {
            app.put(routePath, middlewares, controller[action]);
        } else if (method === 'DELETE') {
            app.delete(routePath, middlewares, controller[action]);
        } else {
            app.get(routePath, middlewares, controller[action]);
        }
    });

    // Assume 'not found' in the error msgs is a 404. this is somewhat silly, but valid, you can do whatever you like, set properties, use instanceof etc.
    app.use(function(err, req, res, next) {
        // If the error object doesn't exists
        if (!err)
            return next();

        // Log it
        console.error(err.stack);

        // Error page
        res.status(500).render('error', {
            message: err.message,
            error: err.stack,
            title: 'error'
        });
    });

    // Assume 404 since no middleware responded
    app.use(function(req, res) {
        res.status(404);
        res.render('error', {
            message: 'Page not found',
            error: {},
            title: 'error'
        });
    });
};
