
var path = require('path');

//'..' for config folder, '.' for config.js file
var root_dir = path.resolve(__dirname, '.') + '/';
var dev_mode = true;

var config = {
  web: {
    /* web server configurations */
    address: '127.0.0.1',
    port: '3006',
  },

  sys: {
    root_dir: root_dir
  },

  app: {
    dev_mode: dev_mode
  }
};

module.exports = config;
