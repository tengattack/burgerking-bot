
var co = require('co');
var burgerking = require('./../lib/burgerking');

function onerror(err) {
  console.error(err.stack);
}

var ctx = new Object();
var fn = co.wrap(burgerking.AutoComplete);
fn.call(ctx, '9806011200602168').catch(onerror);
