
var Router = require('koa-router');
var bot = new Router();

var fs = require('fs');
var config = require('./../config');

var TellBurgerKing = require('./../lib/burgerking'),
  ocr = require('./../lib/ocr').ocr;

function saveRecord(scode, vcode) {
  fs.appendFile(config['sys'].upload_dir + 'records.txt',
    scode + ' ' + vcode + '\n', function (err) {});
}

bot.post('/code', function *(next) {
  var r = { code: -1 };
  if (this.request.body && this.request.body.survey_code) {
    var survey_code = this.request.body.survey_code;
    var tellbk = new TellBurgerKing();
    r = yield tellbk.AutoComplete(survey_code);
    if (r.code === 0) {
      saveRecord(survey_code, r.verify_code);
    }
  }
  this.body = r;
});

bot.post('/ocr', function *(next) {
  var r = { code: -1 };
  if (this.request.files && this.request.files.survey_code_img) {
    var f = this.request.files.survey_code_img;
    var supportTypes = ['.jpg', '.jpeg', '.gif', '.png'];
    if (supportTypes.indexOf(f.extname) !== -1) {
      var text = yield ocr(f.savepath);
      if (text) {
        r.code = 0;
        r.text = text;
      } else {
        r.code = 6;
        r.message = '识别失败';
      }
    } else {
      r.code = 5;
      r.message = '不支持的图片类型';
    }
  }
  this.body = r;
});

module.exports = bot;
