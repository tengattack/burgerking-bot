
var config = require('./../config');
var fs = require('fs');

var algoscript = fs.readFileSync(config['sys'].public_dir + 'scripts/burgerking-algo.js', {encoding: 'utf8'});
var data = fs.readFileSync(config['sys'].root_dir + 'test/records.txt', {encoding: 'utf8'});

eval(algoscript);

function rlog(str) {
  process.stdout.write(str);
};

if (data) {
  var lines = data.split('\n');
  var count = 0, passing = 0;
  for (var i = 0; i < lines.length; i++) {
    if (lines[i]) {
      count++;
    }
  }
  for (var i = 0; i < lines.length; i++) {
    if (lines[i]) {
      var sv = lines[i].split(' ');
      if (sv.length == 2) {
        var v = bkCalculateVcode(sv[0]);
        if (v === sv[1]) {
          passing++;
          rlog('passing (' + passing + '/' + count + ')  \r');
        } else {
          console.log(sv[0], sv[1], v, '|', sv[0][6], sv[0][8], '|', v[5], sv[1][5]);
        }
      }
    }
  }
  rlog('passing (' + passing + '/' + count + ')  \r');
  rlog('\nfin.\n');
}
