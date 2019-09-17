
function extractParamsFromUrl(url) {
  const out = {};
  const indx = url.indexOf('?');
  const arr = url.substring(indx + 1).split('&');
  for (let i = 0; i < arr.length; i += 1) {
    const c = arr[i].split('=');
    let ix;
    [ix, out[ix]] = c;
  }
  return out;
}

module.exports = extractParamsFromUrl;
