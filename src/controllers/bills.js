const models = require('../../models');
const logger = require('../helpers/logger');

const { Bill, User } = models;

const billController = {
  replenishment: async (ctx) => {
    const { body } = ctx.request;
    const { userId, amount } = body;
    try {
      const sum = await addBillRecord(userId, amount, 'replenishment', 'Tinkoff');
      await userSetBallance(userId, sum);
      ctx.body = { result: 'ok' };
    } catch (err) {
      logger.error(err);
    }
  },

  // TODO: replace it to console folder;
  billing: async (ctx) => {
    const { body } = ctx.request;
    const { userId, amount } = body;
    try {
      const sum = await addBillRecord(userId, amount, 'billing', 'billing');
      await userSetBallance(userId, sum);
      ctx.body = { result: 'ok' };
    } catch (err) {
      logger.error(err);
    }
  },
};

async function addBillRecord(userId, sum, operationType, comment) {
  const billRecord = await Bill.build({
    UserId: userId,
    sum,
    operationType,
    comment,
  });
  await billRecord.save();
  // TODO - update balance in user!!!
  const out = await Bill.sum('sum', { where: { UserId: userId } });
  return out;
}

async function userSetBallance(userId, sum) {
  const user = await User.findByPk(userId);
  user.balance = sum;
  await user.save();
}

module.exports = billController;
