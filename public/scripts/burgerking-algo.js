
function isVaildSCode(scode) {
  if (typeof scode === 'string') {
    if (scode && scode.length === 16) {
      return /^\d+$/.test(scode)
    }
  }
  return false
}

function bkCalculateVcode(scode) {
  var s = [0];
  var v = '';
  if (scode && scode.length === 16) {
    for (var i = 0; i < scode.length; i++) {
      s[i + 1] = parseInt(scode[i]);
    }
  } else {
    return 'Error survey code';
  }
  v += ((s[4] == 0 ? 1 : s[4]) - s[9] + 9) % 10;
  v += (10 - s[4]) % 10;
  v += s[1];
  v += s[9];

  var s79 = s[7] * 10 + s[9];
  var vt = s79 - Math.ceil((s79 - ((s[4] == 0) ? 1 : s[4]) + 1) / 10);
  v += (vt < 10) ? ('0' + vt) : vt.toString();

  v += s[7];
  v += s[4];
  return v;
}

if (typeof exports !== 'undefined') {
  // export for node
  exports.calculateVcode = bkCalculateVcode;
  exports.isVaildSCode = isVaildSCode;
}
