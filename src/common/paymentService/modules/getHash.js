require('dotenv').config();
const crypto = require('crypto');

const terminalPassword = process.env.TERMINAL_PASSWORD;

if (!terminalPassword) throw new Error('TERMINAL_PASSWORD must be defined in env.');

/**
 * @param { Object } input
 * Tinkoff token, for more information see:
 * https://oplata.tinkoff.ru/landing/develop/documentation/autopayment
 */

function getHash(input) {
  const tmp = Object.keys(input);
  const arr = tmp.reduce((acc, el) => {
    const data = {};
    data[el] = input[el];
    acc.push(data);
    return acc;
  }, []);
  arr.push({ Password: terminalPassword });
  const sorted = arr.sort(compare);
  const concated = sorted
    .map(el => el[Object.keys(el)[0]])
    .join('');
  const hash = crypto.createHash('sha256').update(concated).digest('hex');
  return hash;
}

function compare(a, b) {
  const aKeys = Object.keys(a);
  const bKeys = Object.keys(b);
  if (aKeys[0] < bKeys[0]) {
    return -1;
  }
  if (aKeys[0] < bKeys[0]) {
    return 1;
  }
  return 0;
}

module.exports = getHash;
