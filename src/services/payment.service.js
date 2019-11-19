require('dotenv').config();
const axios = require('axios');
const crypto = require('crypto');
const models = require('../../models');

const logger = require('../helpers/logger');

const { Bill, User } = models;

const apiUrl = process.env.API_URL;
const NotificationURL = process.env.NOTIFICATION_URL;
const terminalKey = process.env.TERMINAL_KEY;
const initUrl = 'https://securepay.tinkoff.ru/v2/Init';
const recurrentUrl = 'https://securepay.tinkoff.ru/v2/Charge';
const failUrl = `${apiUrl}/error.html`;
const terminalPassword = process.env.TERMINAL_PASSWORD;

if (!terminalKey) throw new Error('TERMINAL_KEY must be defined in env.');
if (!terminalPassword) throw new Error('TERMINAL_PASSWORD must be defined in env.');
if (!NotificationURL) throw new Error('NOTIFICATION_URL must be defined in env.');
if (!apiUrl) throw new Error('API_URL must be defined in env.');

const paymentService = {
  paySubscription: async (uid, sum) => {
    try {
      if (!uid) throw new Error('User id (uid) required');
      logger.info('paySubscription', { uid });
      const rebillSet = await isRebillIdSet(uid);
      logger.info(`paySubscription rebillSet: ${rebillSet}`);
      let returnUrl = null;
      if (!rebillSet) {
        returnUrl = makeInitPayment(uid, sum);
      } else {
        await makeRecurrentPayment(uid, sum);
        returnUrl = `${apiUrl}/account/${uid}`;
      }

      return returnUrl;
    } catch (error) {
      logger.error(error.message);
      return failUrl;
    }
  },

  setPaymentStatus: async (status, orderId) => {
    const bill = await Bill.findByPk(orderId);
    if (bill) {
      bill.isPaymentFinished = status;
      await bill.save();
      await updateBallanceById(bill.UserId);
    }
  },

  storeRebillIdForUser: async (OrderId, rebillId) => {
    const userId = await getUserIdByOrderId(OrderId);
    const user = await User.findByPk(userId);
    if (!user) {
      throw new Error(
        `User with id: ${userId} not found. Check integrity of database. `,
      );
    }
    user.rebillId = rebillId;
    await user.save();
    return true;
  },

  test: async () => {
    const uid = 1;
    const rebillId = '123456789';
    await storeRebillId(uid, rebillId);
    // clearRebillId(uid);
    console.log('================>', await isRebillIdSet(uid));
  },
};

async function getUserIdByOrderId(orderId) {
  const order = Bill.findByPk(orderId);
  if (!order) throw new Error(`Order with id: ${orderId} not found.`);
  return order.UserId;
}

async function addBillRecord(userId, sum, operationType, comment) {
  const billRecord = await Bill.build({
    UserId: userId,
    sum,
    operationType,
    comment,
    isPaymentFinished: null,
  });
  await billRecord.save();
  // TODO - update balance in user!!!
  const out = billRecord.id;
  return out;
}

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

async function updateBallanceById(id) {
  const sum = await Bill.sum('sum', { where: { UserId: id, isPaymentFinished: true } });
  const user = await User.findByPk(id);
  user.lowBallance = (sum < 0);
  user.balance = sum;
  await user.save();
  logger.info('done updateBallanceById for id: ', id);
  return null;
}
/**
 *
 * @param {*} userId
 * @param {*} rebillId // need for recurrent payment:
 * https://oplata.tinkoff.ru/landing/develop/documentation/
 */
async function storeRebillId(userId, rebillId) {
  logger.info(`storeRebillId fired with id: ${userId} and rebillId: ${rebillId}`);
  if (!rebillId) throw new Error('Rebuild required.');
  await User.update(
    { rebillId },
    {
      where: { id: userId },
    },
  );
}

async function clearRebillId(userId) {
  logger.info(`clearRebillId fired with id: ${userId}`);
  await User.update(
    { rebillId: null },
    {
      where: { id: userId },
    },
  );
}

async function isRebillIdSet(userId) {
  logger.info(`isRebillIdSet fired with id: ${userId}`);
  const user = await User.findByPk(userId);
  if (!user) throw new Error(`User with id: ${userId} not found`);
  const { rebillId } = user;
  return !!rebillId;
}

async function getRebillId(userId) {
  logger.info(`getRebillId fired with id: ${userId}`);
  const user = await User.findByPk(userId);
  if (!user) throw new Error(`User with id: ${userId} not found`);
  const { rebillId } = user;
  return rebillId;
}

async function makeInitPayment(uid, sum) {
  logger.info(`makeInitPayment is fired with userId: ${uid}, sum: ${sum}`);
  const uidAsStr = `${uid}`;
  const orderId = await addBillRecord(uid, sum, 'replenishment', 'tinkoff');
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
  if (!res.data.Success) throw Error('Payment API Error.');
  if (!res.data.PaymentURL) throw Error('Payment API Error.');
  console.log('=========================>', res.data);
  return res.data.PaymentURL;
}

async function makeRecurrentPayment(uid, sum) {
  logger.info(`makeRecurrentPayment is fired with userId: ${uid}, sum: ${sum}`);
  const uidAsStr = `${uid}`;
  const orderId = await addBillRecord(uid, sum, 'replenishment', 'tinkoff');
  const rebillId = await getRebillId(uid);
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

  console.log('res  =========================>', res2.data);
  if (!res.data.Success) throw Error('Payment API Error.');
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
  const res2 = await axios.post(initUrl, postParams);

  console.log('res 2 =========================>', res2.data);


  return res.data.PaymentURL;
}

module.exports = paymentService;
