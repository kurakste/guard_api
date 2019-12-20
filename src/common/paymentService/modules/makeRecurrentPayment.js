const axios = require('axios');
const logger = require('../../../helpers/logger');
const getRebillId = require('./getRebillId');
const getHash = require('./getHash');
const addBillRecord = require('./addBillRecord');

const terminalKey = process.env.TERMINAL_KEY;
const NotificationURL = process.env.NOTIFICATION_URL;
const initUrl = 'https://securepay.tinkoff.ru/v2/Init';
const recurrentUrl = 'https://securepay.tinkoff.ru/v2/Charge';


if (!NotificationURL) throw new Error('NOTIFICATION_URL must be defined in env.');


/**
 * @param {*} uid User id
 * @param {*} sum amount of money
 * @param {*} type Operation type: 1) replenishment, 2) paymentForCall
 */
async function makeRecurrentPayment(uid, sum, optype, subscriptionId, couponId) {
  logger.info(`makeRecurrentPayment is fired with userId: ${uid}, sum: ${sum}`);
  const uidAsStr = `${uid}`;
  const rebillId = await getRebillId(uid);
  const comment = couponId || 'tinkoff';
  if (!rebillId) {
    logger.error(`makeRecurrentPayment: userId: ${uid} has no rebillId`);
    return false;
  }
  const orderId = await addBillRecord(uid, sum, optype, comment, subscriptionId);

  const postParams = {
    Amount: sum * 100,
    TerminalKey: terminalKey,
    NotificationURL,
    OrderId: orderId,
    CustomerKey: uidAsStr,
  };

  getHash(postParams);
  const hash = getHash(postParams);
  postParams.Token = hash;
  const res = await axios.post(initUrl, postParams);

  if (res.data.Success) {
    if (!res.data.PaymentURL) throw Error('Payment API Error.');
    const { PaymentId } = res.data;
    if (!PaymentId) throw new Error('PaymentId is required');

    const postRecurrentParam = {
      TerminalKey: terminalKey,
      PaymentId,
      RebillId: rebillId,
    };
    const hash2 = getHash(postRecurrentParam);
    postRecurrentParam.Token = hash2;
    const res2 = await axios.post(recurrentUrl, postRecurrentParam);
    const { Success } = res2.data;
    logger.info(`makeRecurrentPayment success with user: ${uid} & sum: ${sum}`);
    return Success;
  }

  logger.error(`Payment API Error. with user: ${uid} & sum: ${sum}`);
  return false;
}

module.exports = makeRecurrentPayment;
