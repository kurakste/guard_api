const models = require('../../models');
const logger = require('../helpers/logger');

const { Bill } = models;

const billController = {
  replenishment: async (ctx) => {
    const { body } = ctx.request;
    const { userId, amount } = body;
    try {
      const billRecord = await Bill.build({
        UserId: userId,
        sum: amount,
        operationType: 'replenishment',
        comment: 'Tinkoff bank',
      });
      await billRecord.save();
    } catch (err) {
      logger.error(err);
    }
  },
};

module.exports = billController;
