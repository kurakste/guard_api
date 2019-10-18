const axios = require('axios');
const crypto = require('crypto');


const terminalKey = process.env.TERMINAL_KEY;
const terminalPassword = process.env.TERMINAL_PASSWORD;

if (!terminalKey) throw new Error('TERMINAL_KEY must be defined in env.');
if (!terminalPassword) throw new Error('TERMINAL_PASSWORD must be defined in env.');

const controller = {
  payMonthlySubscriptionInit: async (ctx) => {
    const url = 'https://securepay.tinkoff.ru/v2/Init';
    // const url = 'https://www.rbc.ru';
    const orderId = '32as25';
    const postParams = {
      Amount: 50000,
      TerminalKey: terminalKey,
      OrderId: orderId,
    };
    getHash(postParams);
    const hash = getHash(postParams);
    postParams.Token = hash;
    const res = await axios.post(url, postParams);
    if (!res.data.Success) throw Error('Payment API Error.');
    if (!res.data.PaymentURL) throw Error('Payment API Error.');
    return ctx.response.redirect(res.data.PaymentURL);
  },
};

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

function getHash(input) {
  const tmp = Object.keys(input);
  const arr = tmp.reduce((acc, el) => {
    const data = {};
    data[el] = input[el];
    acc.push(data);
    return acc;
  }, []);
  arr.push({ Password: terminalPassword });
  console.log('====>', arr);
  const sorted = arr.sort(compare);
  const concated = sorted
    .map(el => el[Object.keys(el)[0]])
    .join('');
  const hash = crypto.createHash('sha256').update(concated).digest('hex');
  return hash;
}

module.exports = controller;
