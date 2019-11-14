const Mustache = require('mustache');
const fs = require('fs');
const paymentService = require('../services/payment.service');
const logger = require('../helpers/logger');
require('dotenv').config();

const apiUrl = process.env.API_URL;

const controller = {

  payMonthlySubscriptionInit: async (ctx) => {
    const { body } = ctx.request;
    const { id } = body;
    const billingSum = parseFloat(process.env.BILLINGSUM);
    const resUrl = await paymentService.paySubscription(id, billingSum);
    return ctx.response.redirect(resUrl);
  },

  paySixMonth: async (ctx) => {
    const { body } = ctx.request;
    const { id } = body;
    const billingSum = parseFloat(process.env.BILLINGSUM);
    const resUrl = await paymentService.paySubscription(id, 6 * billingSum);
    return ctx.response.redirect(resUrl);
  },

  payOneYear: async (ctx) => {
    const { body } = ctx.request;
    const { id } = body;
    const billingSum = parseFloat(process.env.BILLINGSUM);
    const resUrl = await paymentService.paySubscription(id, 12 * billingSum);
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

  postPaymentNotification: async (ctx) => {
    const { body } = ctx.request;
    const { success, OrderId } = body;

    await paymentService.setPaymentStatus(success, OrderId);
    ctx.response.body = 'OK';
  },
};


module.exports = controller;
