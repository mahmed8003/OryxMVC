var path = require('path');
var rootPath = path.normalize(__dirname + '/..');
var env = process.env.NODE_ENV || 'development';
var port = process.env.PORT || 3000;

var config = {
    development: {
        root: rootPath,
        app_name: 'facebook-node-app',
        env: env,
        port: port
    },
    test: {
        root: rootPath,
        app_name: 'facebook-node-app',
        env: env,
        port: port
    },
    production: {
        root: rootPath,
        app_name: 'facebook-node-app',
        env: env,
        port: port
    }
};

module.exports = config[env];
