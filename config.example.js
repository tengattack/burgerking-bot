
var path = require('path');

//'..' for config folder, '.' for config.js file
var root_dir = path.resolve(__dirname, '.') + '/';
var public_dir = root_dir + 'public/';

var upload_dir = public_dir + 'data/';
var tmp_dir = public_dir + 'data/tmp/';

var dev_mode = true;

var config = {
  web: {
    /* web server configurations */
    address: '127.0.0.1',
    port: '3006',
    static_file_server: true
  },

  bot: {
    token: '[telegram-bot-token]',
  },

  sys: {
    public_dir: public_dir,
    upload_dir: upload_dir,
    root_dir: root_dir,
    tmp_dir: tmp_dir
  },

  app: {
    dev_mode: dev_mode
  }
};

module.exports = config;
