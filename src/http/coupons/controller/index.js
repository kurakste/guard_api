const fs = require('fs');
const Mustache = require('mustache');
const logger = require('../../../helpers/logger');
const activateCoupon = require('../services/activateCoupon');

const apiUrl = process.env.API_URL;
if (!apiUrl) throw new Error('API_URL is required.');

const couponsController = {
  getCouponActivationPage: async (ctx) => {
    const { params } = ctx;
    const { id } = params;

    logger.info('getCouponActivationPage', { id });
    try {
      const pt = `${__dirname}/../../../views/couponActivatePage.html`;
      const template = fs.readFileSync(pt).toString('utf8');
      Mustache.parse(template);
      const body = Mustache.render(template, { apiUrl, id });
      ctx.response.body = body;
    } catch (err) {
      logger.error(err.message);
    }
    return ctx;
  },

  postActivateCoupons: async (ctx) => {
    const { body } = ctx.request;
    const { couponId, UserId } = body;
    logger.info('postActivateCoupons', { couponId, UserId });
    const resUrl = await activateCoupon(couponId, UserId);
    console.log('=========> ', resUrl);
    return ctx.response.redirect(resUrl);
  },
};

module.exports = couponsController;
