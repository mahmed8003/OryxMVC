// modules =================================================
var http = require('http');
var express = require('express');
var morgan = require('morgan');
var bodyParser = require('body-parser');
var session = require('express-session');
var compress = require('compression');
var methodOverride = require('method-override');
var cookieParser = require('cookie-parser');
var helmet = require('helmet');
var flash = require('connect-flash');
var path = require('path');
var cons = require('consolidate');
var swig = require('swig');
var mongoose = require('mongoose');
var Sequelize = require('sequelize');

// express initialization
var root = __dirname;
// all environments
var env = process.env.NODE_ENV || 'development';
var port = process.env.PORT || 3000;

var app = express();

app.set('env', env);
app.set('port', port);
//app.use(express.favicon());

// Showing stack errors
app.set('showStackError', true);

// Set swig as the template engine
app.engine('html', cons.swig);

// Set views path and view engine
app.set('view engine', 'html');
app.set('views', path.join(__dirname, './app/views'));

// Should be placed before express.static
app.use(compress({
    filter: function(req, res) {
        return (/json|text|javascript|css/).test(res.getHeader('Content-Type'));
    },
    level: 9
}));

// Environment dependent middleware
if (env === 'development') {
    // Enable logger (morgan)
    app.use(morgan('dev'));

    // Disable views cache
    app.set('view cache', false);

    //set swig defaults for development env
    swig.setDefaults({cache: false, loader: swig.loaders.fs(path.join(__dirname, './app/views'))});

} else if (env === 'production') {
    // Enable logger (morgan)
    app.use(morgan('tiny'));

    // Enable views cache
    app.locals.cache = 'memory';

    //set swig defaults for production env
    //swig.setDefaults({cache: 'memory'});
    swig.setDefaults({cache: 'memory', loader: swig.loaders.fs(path.join(__dirname, './app/views'))});

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

// Setting the app router and static folder
app.use(express.static(path.resolve('./public')));


// database configuration ===========================================
var dbconfig = require(path.resolve('./app/config/db'));
var sdbc = dbconfig[env]; // selected db configuration
try {
    mongoose = require('mongoose');
    var constr = 'mongodb://' + sdbc['username'] + ':' + sdbc['password'] + '@' + sdbc['host'] + ':' + sdbc['port'] + '/' + sdbc['database'];
    mongoose.connect(constr);
} catch (err) {
    logger.error(err, 'Unable to connect to database');
    process.exit();
}

/*
var sequelize = new Sequelize(sdbc['database'], sdbc['username'], sdbc['password'], {
    host: sdbc['host'],
    port: sdbc['port'],
    // disable logging; default: console.log
    logging: false,
    // max concurrent database requests; default: 50
    maxConcurrentQueries: 100
});
*/

// routes ==================================================
var routes = require(path.join(root, './app/config/routes.js'));

// using middleware
routes.commonmw.forEach(function(mwName) {
    var middleware = require(path.join(root, './app/middlewares', mwName, 'Middleware.js'));
    app.use(middleware);
});

routes.routes.forEach(function(route) {
    var controller = require(path.join(root, './app/controllers', route.controller + 'Controller.js'));
    var type = route.type || 'GET';
    var mwNames = [];

    if (route.hasOwnProperty('mw')) {
        mwNames = route.mw;
    }

    var middlewares = [];
    for (i = 0; i < mwNames.length; i++) {
        var mwName = mwNames[i];
        middlewares[i] = require(path.join(root, './app/middlewares', mwName, 'Middleware.js'));
    }

    if (type === 'POST') {
        app.post(route.route, middlewares, controller[route.action]);
    } else if (type === 'PUT') {
        app.put(route.route, middlewares, controller[route.action]);
    } else if (type === 'DELETE') {
        app.delete(route.route, middlewares, controller[route.action]);
    } else {
        app.get(route.route, middlewares, controller[route.action]);
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
    res.status(500).render('500', {
        error: err.stack
    });
});

// Assume 404 since no middleware responded
app.use(function(req, res) {
    res.status(404).render('404', {
        url: req.originalUrl,
        error: 'Not Found'
    });
});

// start app ===============================================
http.createServer(app).listen(app.get('port'), function() {
    console.log('Magic happens on port ' + app.get('port'));
});