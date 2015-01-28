
var config = require('./config');
var koa = require('koa');

var controller = require('./controller'),
  middlewares = require('./lib/middlewares.js');

var app = module.exports = koa();

middlewares(app);
controller(app);

/*
* Development static file server only.
* */
if (config['web'].static_file_server) {
  var serve = require('koa-static');
  app.use(serve('public/'));
}
