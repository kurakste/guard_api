const axios = require('axios');
const logger = require('../../../helpers/logger');
const addBillRecord = require('./addBillRecord');
const getHash = require('./getHash');

const NotificationURL = process.env.NOTIFICATION_URL;
const terminalKey = process.env.TERMINAL_KEY;
const initUrl = 'https://securepay.tinkoff.ru/v2/Init';


if (!terminalKey) throw new Error('TERMINAL_KEY must be defined in env.');
if (!NotificationURL) throw new Error('NOTIFICATION_URL must be defined in env.');

async function makeInitPayment(uid, sum, type, subscriptionId) {
  logger.info(`makeInitPayment is fired with userId: ${uid}, sum: ${sum}`);
  const uidAsStr = `${uid}`;
  const orderId = await addBillRecord(uid, sum, type, 'tinkoff', subscriptionId);
  const postParams = {
    Amount: sum * 100,
    TerminalKey: terminalKey,
    NotificationURL,
    OrderId: orderId,
    Recurrent: 'Y',
    CustomerKey: uidAsStr,
  };
  postParams.Token = getHash(postParams);
  const res = await axios.post(initUrl, postParams);
  if (!res.data.Success) {
    const { Message, Details } = res.data;
    const msg = `Payment API Error. Message: ${Message}. Details: ${Details}`;
    throw Error(msg);
  }
  if (!res.data.PaymentURL) throw Error('Payment API Error. PaymentURL is empty');
  return res.data.PaymentURL;
}

module.exports = makeInitPayment;
