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
  // TODO: Add automatic subscription's extension.

}

// async function addBillingRecordById(id) {
//   const bill = new Bill();
//   bill.UserId = id;
//   bill.sum = -1 * dailyBillingSum;
//   bill.comment = 'Daily billing';
//   bill.operationType = 'Daily billing';
//   bill.isPaymentFinished = true;
//   await bill.save();
//   logger.info('Done addBillingRecordById', { id });
//   return null;
// }

// async function updateBallanceById(id) {
//   const sum = await Bill.sum('sum', { where: { UserId: id, isPaymentFinished: true } });
//   const user = await User.findByPk(id);
//   user.lowBallance = (sum < 0);
//   user.balance = sum;
//   await user.save();
//   logger.info('done updateBallanceById for id:', { id });
//   return null;
// }

module.exports = doBilling;
