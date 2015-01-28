
var config = require('./../config');
var tesseract = require('node-tesseract');

var options = {
  l: 'eng',
  psm: 9
};

function ocr(imgfile) {
  // Recognize text of any language in any format
  return function (callback) {
    tesseract.process(imgfile, options, function (err, text) {
      if (err) {
        return callback(err);
      }
      //process text
      if (typeof text === 'string') {
        text = text.trim();
        var m = text.match(/([0-9]{16})/);
        if (m) {
          text = m[1];
        }
        callback(null, text);
      } else {
        callback(new Error('未知错误'));
      }
    });
  };
}

exports.ocr = ocr;
