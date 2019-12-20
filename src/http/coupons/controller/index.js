const logger = require('../../../helpers/logger');
const activateCoupon = require('../services/activateCoupon');

const couponsController = {
  getCouponActivationPage: async (ctx) => {
    logger.info('getCouponActivationPage', { ctx });
  },

  postActivateCoupons: async (ctx) => {
    const { body } = ctx.request;
    const { couponId, UserId } = body;
    logger.info('postActivateCoupons', { couponId, UserId });
    const res = await activateCoupon(couponId, UserId);
    console.log('=========> ', res);
  },
};

module.exports = couponsController;
