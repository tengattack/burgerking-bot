
var co = require('co');
var burgerking = require('./../lib/burgerking');

function onerror(err) {
  console.error(err.stack);
}

function *main(code) {
  var r = yield burgerking.AutoComplete(code);
  console.log(r);
  return r;
}

var ctx = new Object();
var fn = co.wrap(main);
fn.call(ctx, '9806011200602168').catch(onerror);
