
var config = require('./../config');

var co = require('co');
var ocr = require('./../lib/ocr').ocr;

function onerror(err) {
  console.error(err.stack);
}

function *main(code) {
  var r = yield ocr(config['sys'].root_dir + 'test/surveycode.jpeg');
  console.log(r);
  return r;
}

var ctx = new Object();
var fn = co.wrap(main);
fn.call(ctx).catch(onerror);
