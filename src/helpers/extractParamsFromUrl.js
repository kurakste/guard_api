
function extractParamsFromUrl(url) {
  const out = {};
  const indx = url.indexOf('?');
  const arr = url.substring(indx + 1).split('&');
  for (let i = 0; i < arr.length; i++) {
    const c = arr[i].split('=');
    out[c[0]] = c[1];
  }
  return out;
}

module.exports = extractParamsFromUrl;
