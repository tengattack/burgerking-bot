
var mount = require('koa-mount');

var bot = require('./bot');

module.exports = function (app) {
  app.use(mount('/bot', bot.middleware()));
};
