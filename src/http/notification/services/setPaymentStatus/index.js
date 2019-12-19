const logger = require('../../../../helpers/logger');
const models = require('../../../../../models');
const updateSubscriptionStatus = require('./updateSubscriptionStatus');
const sendMessageForUser = require('./sendMessageForUser');

const { Bill } = models;

async function setPaymentStatus(status, orderId) {
  logger.info('setPaymentStatus: ', { status, orderId });
  try {
    const bill = await Bill.findByPk(orderId);
    if (!bill) throw Error(`Bill with id: ${orderId} not found`);
    if (bill) {
      bill.isPaymentFinished = status;
      await bill.save();
      if (bill.operationType === 'subscriptionPayment') {
        await updateSubscriptionStatus(bill.UserId, bill.subscriptionId);
        sendMessageForUser(bill.UserId, 'Платежи', 'Ваша подписка была успешно оплачена.');
      }
    }
  } catch (error) {
    logger.error('setPaymentStatus: ', { msg: error.message });
  }
}

module.exports = setPaymentStatus;
