
var config = require('./../config');
var constants = require('constants');

var _ = require('underscore');

var MyRequest = require('./request'),
  generator = require('./generator');

var opts = {
  port: 443,
  secureOptions: constants.SSL_OP_NO_TLSv1_2,
  ciphers: 'ECDHE-RSA-AES256-SHA:AES256-SHA:RC4-SHA:RC4:HIGH:!MD5:!aNULL:!EDH:!AESGCM',
  honorCipherOrder: true
};

var BK_URL = 'https://www.tellburgerking.com.cn';

var rlog;
if (config['app'].dev_mode) {
  rlog = function (str) {
    process.stdout.write(str);
  };
} else {
  rlog = function () {};
}

function TellBurgerKing() {
  var request = new MyRequest(opts);
  this.yreq = new generator(request);
}

TellBurgerKing.parseSurveyUrl = function (body) {
  var m = body.match(/<form\s[^>]*?id="surveyEntryForm"\s[^>]*?action="(.+?)"/i);
  return m ? ('/' + m[1]) : null;
};

TellBurgerKing.getFormData = function (body) {
  var m = body.match(/<form [^>]*?action="(.+?)"[^>]*?>([\s\S]+?)<\/form>/i);
  var radios = {}, checkboxs = [];
  var fd = {};
  var found = false;
  if (m) {
    var url = '/' + m[1];
    var sfd = m[2];
    var inputpat = /<input [^>]*?type="(.+?)" [^>]*?name="(.+?)" [^>]*?value="(.*?)" [^>]*?>/ig;
    while (m = inputpat.exec(sfd)) {
      var type = m[1], name = m[2], value = m[3];
      if (type == 'radio') {
        if (!radios[name]) {
          radios[name] = [value];
        } else {
          radios[name].push(value);
        }
      } else if (type == 'checkbox') {
        checkboxs.push(name);
      } else {
        fd[name] = value;
      }
      found = true;
    }
  }
  if (found) {
    var hascheckbox = false;
    for (var n in radios) {
      fd[n] = _.sample(radios[n]);
    }
    if (checkboxs.length > 0) {
      var len = checkboxs.length;
      var selcount = _.random(1, len);
      var sels = _.sample(checkboxs, selcount);
      sels.forEach(function (n) {
        fd[n] = 1;
      });
    }
    return { url: url, formdata: fd };
  }
  return null;
};

TellBurgerKing.prototype.getSurveyUrl = function *() {
  var url = BK_URL + '/?AspxAutoDetectCookieSupport=1';
  var r;
  while (true) {
    if (/^\/\(X/.test(url)) {
      url = BK_URL + url.replace(/^\/[^\/]+(\/.+)$/, '$1');
    } else if (url[0] == '/') {
      url = BK_URL + url;
    }
    r = yield this.yreq.get(url, {rejectUnauthorized: false});
    if (r[0].statusCode == 302) {
      url = r[0].headers.location;
    } else {
      break;
    }
  }
  return TellBurgerKing.parseSurveyUrl(r[1]);
};

TellBurgerKing.prototype.postSurveyCode = function *(surveyUrl, code) {
  var formdata = {
    JavaScriptEnabled: 1,
    FIP: 'True',
    NextButton: '开始'
  };
  var cnCount = 6;
  /*if (code.length === 16)*/ {
  for (var i = 0; i < cnCount; i++) {
    formdata['CN' + (i + 1).toString()] = code.substr(i * 3, 3);
  }
  }
  return yield this.yreq.post(BK_URL + surveyUrl, formdata);
};

TellBurgerKing.prototype.getVCode = function *(finUrl) {
  var r = yield this.yreq.get(BK_URL + finUrl);
  if (r[0].statusCode == 200) {
    var m = r[1].match(/<p class="ValCode">[^<]*?(\d+?)<\/p>/i);
    if (m) {
      return m[1];
    }
  }
  return '';
};

TellBurgerKing.prototype.postFormData = function *(surverNextUrl, formdata) {
  return yield this.yreq.post(BK_URL + surverNextUrl, formdata);
};

TellBurgerKing.prototype.AutoComplete = function *(code) {
  var r = { code: -1 };
  var surveyUrl = yield this.getSurveyUrl();
  if (surveyUrl) {
    var resp = yield this.postSurveyCode(surveyUrl, code);
    if (resp[0].statusCode == 302) {
      r.code = 1;
      r.message = '错误的调查码';
      return r;
    } else {
      var finished = false;
      while (true) {
        rlog('.');
        var fd = TellBurgerKing.getFormData(resp[1]);
        resp = yield this.postFormData(fd.url, fd.formdata);
        if (resp[0].statusCode == 302) {
          finished = true;
          break;
        } else if (resp[0].statusCode != 200) {
          r.code = 2;
          r.message = '错误, HTTP代码: ' + resp[0].statusCode;
          console.error(new Date(), resp[0].statusCode, resp[1]);
          break;
        }
      }
      rlog('\n');
      if (finished) {
        var finUrl = resp[0].headers.location;
        if (finUrl[0] != '/') finUrl = '/' + finUrl;
        var vcode = yield this.getVCode(finUrl);
        if (vcode) {
          r.code = 0;
          r.verify_code = vcode;
        } else {
          r.code = 3;
          r.message = '无法获取验证码';
        }
      }
    }
  }
  return r;
};

module.exports = TellBurgerKing;
