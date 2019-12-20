const models = require('../../../../models');
const logger = require('../../../helpers/logger');

const { User } = models;

async function getRebillId(userId) {
  logger.info(`getRebillId fired with id: ${userId}`);
  const user = await User.findByPk(userId);
  if (!user) throw new Error(`User with id: ${userId} not found`);
  const { rebillId } = user;
  return rebillId;
}

module.exports = getRebillId;
