const logger = require('../../../helpers/logger');
const models = require('../../../../models');

const { User } = models;

async function clearRebillId(userId) {
  logger.info(`clearRebillId fired with id: ${userId}`);
  try {
    const user = await User.findByPk(userId);
    if (!user) throw new Error(`clearRebillId: User with id: ${userId} not found in Db.`);
    await User.update(
      { rebillId: null },
      {
        where: { email: user.email },
      },
    );
  } catch (err) {
    logger.error(`clearRebillId: error for user: ${userId}: ${err.message}`);
    return false;
  }
  return true;
}

module.exports = clearRebillId;
