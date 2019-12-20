require('dotenv').config();
const Mustache = require('mustache');
const fs = require('fs');
const paymentService = require('../common/paymentService');
const userService = require('../services/users.service');
const subscriptionService = require('../subscriptions/subscription.service');
const logger = require('../helpers/logger');

const apiUrl = process.env.API_URL;

const controller = {

  payMonthly: async (ctx) => {
    const { body } = ctx.request;
    // id is the user id here
    const { id } = body;
    const [subscriptionCost, subscriptionId] = await subscriptionService.getMonthlyCost();
    const resUrl = await paymentService.paySubscription(id, subscriptionCost, subscriptionId);
    // это нужно делать после подтверждения банка.
    // if (result) userService.setSubscription(id, subscriptionIds.month);
    return ctx.response.redirect(resUrl);
  },

  payThreeMonth: async (ctx) => {
    const { body } = ctx.request;
    const { id } = body;
    const [subscriptionCost, subscriptionId] = await subscriptionService.getThreeMonthCost();
    const resUrl = await paymentService.paySubscription(id, subscriptionCost, subscriptionId);
    return ctx.response.redirect(resUrl);
  },

  paySixMonth: async (ctx) => {
    const { body } = ctx.request;
    const { id } = body;
    const [subscriptionCost, subscriptionId] = await subscriptionService.getSixMonthCost();
    const resUrl = await paymentService.paySubscription(id, subscriptionCost, subscriptionId);
    return ctx.response.redirect(resUrl);
  },

  payOneYear: async (ctx) => {
    try {
      const { body } = ctx.request;
      const { id } = body;
      const [subscriptionCost, subscriptionId] = await subscriptionService.getOneYear();
      const resUrl = await paymentService.paySubscription(id, subscriptionCost, subscriptionId);
      return ctx.response.redirect(resUrl);
    } catch (err) {
      logger.error('payOneYear: ', err);
      return null;
    }
  },

  getPaymentPage: async (ctx) => {
    const { params } = ctx;
    const { id } = params;
    logger.info('getPaymentForm', { id });
    const master = await userService.isUserMaster(id);
    const pt = (master)
      ? `${__dirname}/../views/payments.html`
      : `${__dirname}/../views/notMasterAccount.html`;
    try {
      if (!id) throw new Error('User id (id) required in URL');
      const template = fs.readFileSync(pt).toString('utf8');
      Mustache.parse(template);
      const body = Mustache.render(template, { id, apiUrl, master });
      ctx.response.body = body;
    } catch (err) {
      logger.error(err.message);
    }
    return ctx;
  },

  getUnsubscribePage: async (ctx) => {
    const { params } = ctx;
    const { id } = params;
    const pt = `${__dirname}/../views/unsubscribe.html`;
    const template = fs.readFileSync(pt).toString('utf8');
    Mustache.parse(template);
    const body = Mustache.render(template, { id, apiUrl });
    ctx.response.body = body;
  },

  postUnsubscribe: async (ctx) => {
    const { body } = ctx.request;
    const { userId } = body;
    logger.info('postUnsubscribe: start for user', { userId });
    const res = paymentService.unsubscribeAndRemoveData(userId);
    const redirectionUrl = res
      ? `${apiUrl}/success-unsubscribe`
      : `${apiUrl}/fail-unsubscribe`;
    return ctx.response.redirect(redirectionUrl);
  },

  getTest: async () => {
  },
};


module.exports = controller;
