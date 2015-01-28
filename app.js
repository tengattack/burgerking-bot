
var constants = require('constants');
var _ = require('underscore');
var co = require('co');
var MyRequest = require('./lib/request'),
  generator = require('./lib/generator');

var opts = {
  port: 443,
  secureOptions: constants.SSL_OP_NO_TLSv1_2,
  ciphers: 'ECDHE-RSA-AES256-SHA:AES256-SHA:RC4-SHA:RC4:HIGH:!MD5:!aNULL:!EDH:!AESGCM',
  honorCipherOrder: true
};
var request = new MyRequest(opts);

var BK_URL = 'https://www.tellburgerking.com.cn';

var yreq = new generator(request);

function rlog(str) {
  process.stdout.write(str);
}

function parseSurveryUrl(body) {
  var m = body.match(/<form\s[^>]*?id="surveyEntryForm"\s[^>]*?action="(.+?)"/i);
  return m ? ('/' + m[1]) : null;
}

function *getSurveryUrl() {
  var url = BK_URL + '/?AspxAutoDetectCookieSupport=1';
  var r;
  while (true) {
    if (/^\/\(X/.test(url)) {
      url = BK_URL + url.replace(/^\/[^\/]+(\/.+)$/, '$1');
    } else if (url[0] == '/') {
      url = BK_URL + url;
    }
    r = yield yreq.get(url, {rejectUnauthorized: false});
    if (r[0].statusCode == 302) {
      url = r[0].headers.location;
    } else {
      break;
    }
  }
  return parseSurveryUrl(r[1]);
}

function *postSurveryCode(surveryUrl, code) {
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
  return yield yreq.post(BK_URL + surveryUrl, formdata);
}

function *getVCode(finUrl) {
  var r = yield yreq.get(BK_URL + finUrl);
  if (r[0].statusCode == 200) {
    var m = r[1].match(/<p class="ValCode">[^<]*?(\d+?)<\/p>/i);
    if (m) {
      return m[1];
    }
  }
  return '';
}

function *postFormData(surverNextUrl, formdata) {
  return yield yreq.post(BK_URL + surverNextUrl, formdata);
}

function getFormData(body) {
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
}

function *main(code) {
  var surveryUrl = yield getSurveryUrl();
  if (surveryUrl) {
    var r = yield postSurveryCode(surveryUrl, code);
    if (r[0].statusCode == 302) {
      console.log('错误的调查码');
      return false;
    } else {
      var finished = false;
      while (true) {
        rlog('.');
        var fd = getFormData(r[1]);
        r = yield postFormData(fd.url, fd.formdata);
        if (r[0].statusCode == 302) {
          finished = true;
          break;
        } else if (r[0].statusCode != 200) {
          console.log('Error, http code', r[0].statusCode);
          console.log(r[1]);
          break;
        }
      }
      rlog('\n');
      if (finished) {
        var finUrl = r[0].headers.location;
        if (finUrl[0] != '/') finUrl = '/' + finUrl;
        var vcode = yield getVCode(finUrl);
        console.log('vcode', vcode);
        return true;
      }
    }
  }
  return false;
}

function onerror(err) {
  console.error(err.stack);
}

var ctx = new Object();
var fn = co.wrap(main);
fn.call(ctx, '9806011200602168').catch(onerror);
