const dotenv = require('dotenv');
const models = require('../../models');
const logger = require('../helpers/logger');

dotenv.config();

const { Bill, User } = models;
const billingSum = -1 * parseFloat(process.env.BILLINGSUM);
if (isNaN(billingSum)) throw new Error('BILLINGSUM doesn\'t set.');

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
  // TODO: нужно разобраться как часто делать биллинг и подробно описать этот процесс. 
  // потом довести до ума этот блок.
  billing: async (ctx) => {
    const { body } = ctx.request;
    const { userId } = body;
    try {
      const sumBefore = await Bill.sum('sum', { where: { UserId: userId } });
      if ((sumBefore + billingSum) < 0) {
        // throw new Error('Ballance too low.');
        const user = await User.findByPk(userId);
        user.lowBallance = true;
        await user.save();
        ctx.body = { result: 'Ballance too low.' };
        return ctx;
      }
      const sum = await addBillRecord(userId, billingSum, 'billing', 'billing');
      await userSetBallance(userId, sum);
      const user = await User.findByPk(userId);
      user.lowBallance = false;
      await user.save();
      ctx.body = { result: 'ok' };
    } catch (err) {
      logger.error(err);
      ctx.body = { result: 'error' };
      return ctx;
    }
    return null;
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
