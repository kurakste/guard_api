require('dotenv').config();
const axios = require('axios');
const crypto = require('crypto');
const models = require('../../models');
const userService = require('./users.service');
const { connectedAppUsers } = require('../socketApi');

console.log('==========service restfull ===========', connectedAppUsers);
// с этим модулем такая история - его пришлось продублировать потому-что
// часть его нужно в socketApi а здесь нужны ссылки на переменные из
// socketApi. Получаются циклические ссылки. Нужно по другому разделить
// блоки кода.
const logger = require('../helpers/logger');

const { Bill, User } = models;

const apiUrl = process.env.API_URL;
const securityCallCast = process.env.SECURITY_CALL_COST;
const NotificationURL = process.env.NOTIFICATION_URL;
const terminalKey = process.env.TERMINAL_KEY;
const initUrl = 'https://securepay.tinkoff.ru/v2/Init';
const recurrentUrl = 'https://securepay.tinkoff.ru/v2/Charge';
const failUrl = `${apiUrl}/error`;
const terminalPassword = process.env.TERMINAL_PASSWORD;

if (!terminalKey) throw new Error('TERMINAL_KEY must be defined in env.');
if (!terminalPassword) throw new Error('TERMINAL_PASSWORD must be defined in env.');
if (!NotificationURL) throw new Error('NOTIFICATION_URL must be defined in env.');
if (!apiUrl) throw new Error('API_URL must be defined in env.');
if (!securityCallCast) throw new Error('Security call cast must be set in .env');

const paymentService = {
  paySubscription: async (uid, sum, subscriptionId) => {
    try {
      if (!uid) throw new Error('User id (uid) required');
      logger.info('paySubscription', { uid });
      const rebillSet = await isRecurrentPaymentAvailable(uid);
      logger.info(`paySubscription rebillSet: ${rebillSet}`);
      let returnUrl = null;
      if (!rebillSet) {
        returnUrl = await makeInitPayment(uid, sum, 'subscriptionPayment', subscriptionId);
      } else {
        const result = await makeRecurrentPayment(uid, sum, 'subscriptionPayment', subscriptionId);
        returnUrl = result ? `${apiUrl}/success` : `${apiUrl}/error`;
      }
      return returnUrl;
    } catch (error) {
      logger.error(`paymentService: ${error.message}`);
      return failUrl;
    }
  },

  setPaymentStatus: async (status, orderId) => {
    const bill = await Bill.findByPk(orderId);
    if (!bill) throw Error(`Bill with id: ${orderId} not found`);
    if (bill) {
      bill.isPaymentFinished = status;
      await bill.save();
      if (bill.operationType === 'subscriptionPayment') {
        await userService.updateSubscriptionStatus(bill.UserId, bill.subscriptionId);
      }
      sendMessageForUser(bill.UserId, 'платежи', 'ваш платеж прошел успешно.');
      // await updateBallanceById(bill.UserId);
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
    // clearRebillId(uid);
  },

  payForSecurityCall: async (userId) => {
    // securityCallCast
    const recurrentAvailable = isRecurrentPaymentAvailable(userId);
    if (!recurrentAvailable) {
      logger.error(`payForSecurityCall: user(${userId} trying to pay with out rebillID)`);
      return false;
    }

    const sum = securityCallCast;
    const result = await makeRecurrentPayment(userId, sum, 'paymentForCall');

    if (!result) {
      logger.error(`payForSecurityCall: user(${userId} trying to pay and failed.`);
      return false;
    }

    return true;
  },

  unsubscribeAndRemoveData: async (uid) => {
    const res = await clearRebillId(uid);
    return res;
  },
};

// ========================= helpers ===========================================
function sendMessageForUser(userId, title, message) {
  if (!connectedAppUsers) {
    logger.error('sendMessageForUser', { connectedAppUsers, userId, title, message })
    return false;
  }
  const user = connectedAppUsers.find(el => el.userId === userId);
  if (!user) {
    logger.error('sendMessageForUser user not found', { userId, title, message });
    return false;
  }
  const { socket } = user.socket;
  socket.emit('srvAlertMessage', {
    title, message,
  });
  return true;
}

async function getUserIdByOrderId(orderId) {
  const order = await Bill.findByPk(orderId);
  if (!order) throw new Error(`Order with id: ${orderId} not found.`);
  return order.UserId;
}

async function addBillRecord(userId, sum, operationType, comment, subscriptionId) {
  const billRecord = await Bill.build({
    UserId: userId,
    sum,
    operationType,
    comment,
    isPaymentFinished: null,
    subscriptionId,
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

// async function updateBallanceById(id) {
//   const sum = await Bill.sum('sum', { where: { UserId: id, isPaymentFinished: true } });
//   const user = await User.findByPk(id);
//   user.lowBallance = (sum < 0);
//   user.balance = sum;
//   await user.save();
//   logger.info('done updateBallanceById for id: ', id);
//   return null;
// }
/**
 *
 * @param {*} userId
 * @param {*} rebillId // need for recurrent payment:
 * https://oplata.tinkoff.ru/landing/develop/documentation/
 */
// async function storeRebillId(userId, rebillId) {
//   logger.info(`storeRebillId fired with id: ${userId} and rebillId: ${rebillId}`);
//   if (!rebillId) throw new Error('Rebuild required.');
//   await User.update(
//     { rebillId },
//     {
//       where: { id: userId },
//     },
//   );
// }

async function clearRebillId(userId) {
  logger.info(`clearRebillId fired with id: ${userId}`);
  try {
    await User.update(
      { rebillId: null },
      {
        where: { id: userId },
      },
    );
  } catch (err) {
    logger.error(`clearRebillId: error for user: ${userId}: ${err.message}`);
    return false;
  }
  return true;
}

async function isRecurrentPaymentAvailable(userId) {
  logger.info(`isRecurrentPaymentAvailable fired with id: ${userId}`);
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

/**
 * @param {*} uid User id
 * @param {*} sum amount of money
 * @param {*} type Operation type: 1) replenishment, 2) paymentForCall
 */
async function makeRecurrentPayment(uid, sum, optype, subscriptionId) {
  logger.info(`makeRecurrentPayment is fired with userId: ${uid}, sum: ${sum}`);
  const uidAsStr = `${uid}`;
  const rebillId = await getRebillId(uid);
  if (!rebillId) {
    logger.error(`makeRecurrentPayment: userId: ${uid} has no rebillId`);
    return false;
  }
  const orderId = await addBillRecord(uid, sum, optype, 'tinkoff', subscriptionId);

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
    logger.info(`makeRecurrentPayment success with user: ${uid} & sum: ${sum}`);
    if (res2 && res2.data) {
      const { Success } = res2.data;
      // if (Success)
      await paymentService.setPaymentStatus(Success, orderId);
      return Success;
    }
    return false;
  }

  logger.error(`Payment API Error. with user: ${uid} & sum: ${sum}`);
  return false;
}

module.exports = paymentService;
