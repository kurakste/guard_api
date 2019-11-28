require('dotenv').config();
const Mustache = require('mustache');
const fs = require('fs');
const paymentService = require('../services/payment.service');
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
    const { body } = ctx.request;
    const { id } = body;
    const [subscriptionCost, subscriptionId] = await subscriptionService.getOneYear;
    const resUrl = await paymentService.paySubscription(id, subscriptionCost, subscriptionId);
    return ctx.response.redirect(resUrl);
  },

  getPaymentPage: async (ctx) => {
    const { params } = ctx;
    const { id } = params;
    logger.info('getPaymentForm', { id });
    try {
      if (!id) throw new Error('User id (id) required in URL');
      const pt = `${__dirname}/../views/payments/payments.html`;
      const template = fs.readFileSync(pt).toString('utf8');
      Mustache.parse(template);
      const body = Mustache.render(template, { id, apiUrl });
      ctx.response.body = body;
    } catch (err) {
      logger.error(err.message);
    }
    return ctx;
  },
  /**
   * Payment notification from bank.
   * For more information see: https://oplata.tinkoff.ru/landing/develop/documentation/autopayment\
   *
   */
  postPaymentNotification: async (ctx) => {
    const { body } = ctx.request;
    const { Success, OrderId, RebillId } = body;
    logger.info('get payment status', { body });

    await paymentService.setPaymentStatus(Success, OrderId);
    if (RebillId) {
      // This is first recurrent payment(init method) we has to save RebuildId
      // for this user.
      // For more information see: https://oplata.tinkoff.ru/landing/develop/documentation/autopayment
      await paymentService.storeRebillIdForUser(OrderId, RebillId);
    }
    ctx.response.body = 'OK';
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
