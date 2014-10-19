
var commonMiddlewares = [];

var routes = [
    {route: '/', controller: 'Home', action: 'index', method: 'GET', middlewares: []}
];



module.exports.commonMiddlewares = commonMiddlewares;
module.exports.routes = routes;
