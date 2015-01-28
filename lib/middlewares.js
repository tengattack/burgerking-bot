
var config = require('./../config');

var logger = require('koa-logger'),
  parse = require('co-body');

module.exports = function (app) {

  app.proxy = true;

  if (config['app']['dev_mode']) {
    app.use(logger());
  }

  app.use(function *(next) {
    if ('POST' == this.method) {
      this.body = yield parse(this);
    }
    yield next;
  });

  app.use(function *(next) {
    try {
      yield next;
    } catch (e) {
      this.body = {
        code: -2,
        message: e.message
      };
    }
  });
};
