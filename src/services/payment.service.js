require('dotenv').config();
const axios = require('axios');
const crypto = require('crypto');
const models = require('../../models');

const logger = require('../helpers/logger');

const { Bill, User } = models;

const apiUrl = process.env.API_URL;
const NotificationURL = process.env.NOTIFICATION_URL;
const terminalKey = process.env.TERMINAL_KEY;
const tinkoffUrl = 'https://securepay.tinkoff.ru/v2/Init';
const failUrl = `${apiUrl}/error.html`;
const terminalPassword = process.env.TERMINAL_PASSWORD;

if (!terminalKey) throw new Error('TERMINAL_KEY must be defined in env.');
if (!terminalPassword) throw new Error('TERMINAL_PASSWORD must be defined in env.');
if (!NotificationURL) throw new Error('NOTIFICATION_URL must be defined in env.');
if (!apiUrl) throw new Error('API_URL must be defined in env.');

const paymentService = {
  paySubscription: async (uid, sum) => {
    try {
      if (!uid) throw new Error('User id (uid) required in get params');
      logger.info('payMonthlySubscriptionInit', { uid });
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
      getHash(postParams);
      const hash = getHash(postParams);
      postParams.Token = hash;
      const res = await axios.post(tinkoffUrl, postParams);
      if (!res.data.Success) throw Error('Payment API Error.');
      if (!res.data.PaymentURL) throw Error('Payment API Error.');
      console.log('=========================>', res.data);
      return res.data.PaymentURL;
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

  test: async () => {
    const uid = 1;
    const rebillId = '123456789';
    await storeRebillId(uid, rebillId);
    // clearRebillId(uid);
    console.log('================>', await isRebillIdSet(uid));
  },
};

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

module.exports = paymentService;
