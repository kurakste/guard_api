const logger = require('../../../helpers/logger');
const models = require('../../../../models');

const { User } = models;

async function isRecurrentPaymentAvailable(userId) {
  logger.info(`isRecurrentPaymentAvailable fired with id: ${userId}`);
  const user = await User.findByPk(userId);
  if (!user) throw new Error(`User with id: ${userId} not found`);
  const { rebillId } = user;
  return !!rebillId;
}

module.exports = isRecurrentPaymentAvailable;
