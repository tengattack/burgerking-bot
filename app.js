
var config = require('./config');
var koa = require('koa');

var controller = require('./controller'),
  middlewares = require('./lib/middlewares.js');

var app = module.exports = koa();

middlewares(app);
controller(app);
