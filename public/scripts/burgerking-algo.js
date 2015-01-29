
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
  v += (s[7] < (s[9] == 0 ? s[9] + 1 : s[9])) ? s[7] : s[7] - 1;
  v += ((s[9] == 0 ? 1 : s[9]) - s[7] + 9) % 10;
  v += s[7];
  v += s[4];
  return v;
}
