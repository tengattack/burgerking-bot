
var Router = require('koa-router');
var bot = new Router();

var burgerking = require('./../lib/burgerking');

bot.post('/code', function *(next) {
  var r = { code: -1 };
  if (this.body && this.body.survey_code) {
    var survey_code = this.body.survey_code;
    r = yield burgerking.AutoComplete(survey_code);
  }
  this.body = r;
});

module.exports = bot;
