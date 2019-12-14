const dotenv = require('dotenv');
const models = require('../../models');
const logger = require('../helpers/logger');

dotenv.config();

const { User, Subscription } = models;

async function doBilling() {
  const users = await User.findAll({
    where: { role: 35, isSubscribeActive: true },
  });

  const a = users.map(el => updateIsSubscribeActiveStatus(
    el.id,
    el.subscriptionId,
    el.subscriptionStartsAt,
  ));
  await Promise.all(a);
  logger.info(`Billing system: processed ${a.length} users. Work done.`);
  return null;
}

async function updateIsSubscribeActiveStatus(userId, subscriptionId, subscriptionStartsAt) {
  const subscription = await Subscription.findByPk(subscriptionId);
  const { lifeTime } = subscription;
  const today = new Date();
  const dataStart = new Date(subscriptionStartsAt);
  const daysPass = Math.ceil(
    Math.abs(
      (dataStart.getTime() - today.getTime()) / (1000 * 3600 * 24) - 1,
    ),
  );
  const daysLeft = lifeTime - daysPass;
  if (daysLeft <= 0) {
    const user = await User.findByPk(userId);
    user.isSubscribeActive = false;
    await user.save();
  }
}

module.exports = doBilling;
