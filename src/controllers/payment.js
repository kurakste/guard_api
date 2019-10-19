const axios = require('axios');
const crypto = require('crypto');
const Mustache = require('mustache');
const fs = require('fs');
const logger = require('../helpers/logger');

const models = require('../../models');

const { Bill } = models;


const terminalKey = process.env.TERMINAL_KEY;
const terminalPassword = process.env.TERMINAL_PASSWORD;

if (!terminalKey) throw new Error('TERMINAL_KEY must be defined in env.');
if (!terminalPassword) throw new Error('TERMINAL_PASSWORD must be defined in env.');

const controller = {
  payMonthlySubscriptionInit: async (ctx) => {
    const url = 'https://securepay.tinkoff.ru/v2/Init';
    // TODO: make error url....
    const failUrl = null;
    const { body } = ctx.request;
    const { uid } = body;
    try {
      if (!uid) throw new Error('User id (uid) required in get params');

      logger.info('payMonthlySubscriptionInit', { uid });
      const billingSum = parseFloat(process.env.BILLINGSUM);
      const orderId = await addBillRecord(uid, billingSum, 'replenishment', 'tinkoff');
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
    } catch (error) {
      logger.error(error.message);
      return ctx.response.redirect(failUrl);
    }
  },

  getPaymentPage: async (ctx) => {
    const params = ctx.request.query;
    const { uid } = params;
    logger.info('getPaymentForm', { uid });
    try {
      if (!uid) throw new Error('User id (uid) required in get params');
      const pt = `${__dirname}/../views/payments/payments.html`;
      const template = fs.readFileSync(pt).toString('utf8');
      Mustache.parse(template);
      const body = Mustache.render(template, { uid });
      ctx.response.body = body;
    } catch (err) {
      logger.error(err.message);
    }
    return ctx;
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

async function addBillRecord(userId, sum, operationType, comment) {
  const billRecord = await Bill.build({
    UserId: userId,
    sum,
    operationType,
    comment,
  });
  await billRecord.save();
  // TODO - update balance in user!!!
  const out = billRecord.id;
  return out;
}

module.exports = controller;
