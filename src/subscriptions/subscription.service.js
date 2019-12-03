const models = require('../../models');
const logger = require('../helpers/logger');
const subscriptionIds = require('./subscription.codes');

const { Subscription } = models;

const subscriptionService = {
  getMonthlyCost: async () => {
    const cost = await subscriptionCost(subscriptionIds.month);
    if (!cost) {
      throw new Error(`Subscription cost 0 
        for subscription id: ${subscriptionIds.month}`);
    }
    return [cost, subscriptionIds.month];
  },

  getThreeMonthCost: async () => {
    const cost = await subscriptionCost(subscriptionIds.threeMonth);
    if (!cost) {
      throw new Error(`Subscription cost 0 
        for subscription id: ${subscriptionIds.threeMonth}`);
    }
    return [cost, subscriptionIds.threeMonth];
  },

  getSixMonthCost: async () => {
    const cost = await subscriptionCost(subscriptionIds.sixMonth);
    if (!cost) {
      throw new Error(`Subscription cost 0 
        for subscription id: ${subscriptionIds.sixMonth}`);
    }
    return [cost, subscriptionIds.sixMonth];
  },

  getOneYear: async () => {
    const cost = await subscriptionCost(subscriptionIds.year);
    if (!cost) {
      throw new Error(`Subscription cost 0 
        for subscription id: ${subscriptionIds.year}`);
    }
    return [cost, subscriptionIds.year];
  },

};

// ==================== private ===============================
async function subscriptionCost(subscriptionId) {
  try {
    logger.info('subscriptionCost', { subscriptionId });
    const subscription = await Subscription.findOne({
      where: { fixId: subscriptionId },
    });
    if (!subscription) {
      logger.error('subscriptionCost doesn\'t find subscription data.', { subscriptionId });
      return false;
    }
    const { cost } = subscription;
    if (!cost) return false;
    return cost;
  } catch (err) {
    logger.error('subscriptionService', { message: err.message });
    return false;
  }
}

module.exports = subscriptionService;
