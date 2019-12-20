require('dotenv').config();
const logger = require('../../helpers/logger');
const isUserMaster = require('./modules/isUserMaster');
const clearRebillId = require('./modules/clearRebillId');
const makeInitPayment = require('./modules/makeInitPayment');
const makeRecurrentPayment = require('./modules/makeRecurrentPayment');
const isRecurrentPaymentAvailable = require('./modules/isRecurrentPaymentAvailable');

const apiUrl = process.env.API_URL;
const securityCallCast = process.env.SECURITY_CALL_COST;
const failUrl = `${apiUrl}/error`;

if (!apiUrl) throw new Error('API_URL must be defined in env.');
if (!securityCallCast) throw new Error('Security call cast must be set in .env');

const paymentService = {
  paySubscription: async (uid, sum, subscriptionId) => {
    try {
      if (!uid) throw new Error('User id (uid) required');
      logger.info('paySubscription', { uid });

      if (!isUserMaster(uid)) throw new Error('Этот экаунт не может производить оплаты.');

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

  payForCoupon: async (uid, subscriptionId) => {
    try {
      if (!uid) throw new Error('User id (uid) required');
      logger.info('payForCoupon', { uid, subscriptionId });

      if (!isUserMaster(uid)) throw new Error('Этот экаунт не может производить оплаты.');

      const rebillSet = await isRecurrentPaymentAvailable(uid);
      logger.info(`payForCoupon rebillSet: ${rebillSet}`);
      let returnUrl = null;
      if (!rebillSet) {
        returnUrl = await makeInitPayment(uid, 1, 'couponPayment', subscriptionId);
      } else {
        const result = await makeRecurrentPayment(uid, 1, 'couponPayment', subscriptionId);
        returnUrl = result ? `${apiUrl}/success` : `${apiUrl}/error`;
      }
      return returnUrl;
    } catch (error) {
      logger.error(`payForCoupon: ${error.message}`);
      return failUrl;
    }
  },

  payForSecurityCall: async (userId) => {
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

module.exports = paymentService;
