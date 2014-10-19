var http = require('http');
var glob = require('glob');
var config = require('./config/config');
var database = require('./config/database');
var express = require('express');
var mongoose = require('mongoose');


var db = database[config.env];
var connectionString = 'mongodb://' + db.username + ':' + db.password + '@' + db.host + ':' + db.port + '/' + db.database;
mongoose.connect(connectionString);
var dbConnection = mongoose.connection;
dbConnection.on('error', function() {
    throw new Error('unable to connect to database at ' + connectionString);
    //process.exit();
});

/*
 var sequelize = new Sequelize(db.database, db.username, db.password, {
 host: db.host,
 port: db.port,
 // disable logging; default: console.log
 logging: false,
 // max concurrent database requests; default: 50
 maxConcurrentQueries: 100
 });
 */

var models = glob.sync(config.root + '/app/models/*Model.js');
models.forEach(function(model) {
    require(model);
});

var app = express();
require('./config/express')(app, config);

// start app ===============================================
http.createServer(app).listen(app.get('port'), function() {
    console.log('Magic happens on port ' + app.get('port'));
});