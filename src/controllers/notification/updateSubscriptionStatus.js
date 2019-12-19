const logger = require('../../helpers/logger');
const models = require('../../../models');

const { User } = models;

async function updateSubscriptionStatus(userId, subscriptionId) {
  const user = await User.findByPk(userId);
  if (!user) {
    logger.error('Not found user in updateSubscriptionStatus', { userId });
    return false;
  }
  try {
    await User.update(
      { subscriptionId, isSubscribeActive: true, subscriptionStartsAt: Date.now() },
      { where: { email: user.email } },
    );
    return true;
  } catch (err) {
    logger.error('updateSubscriptionStatus', { userId, subscriptionId });
    return false;
  }
}

module.exports = updateSubscriptionStatus;
