const logger = require('../../../../helpers/logger');
const models = require('../../../../../models');
const paymentService = require('../../../../common/paymentService');


const { Coupon } = models;

async function activateCoupons(couponId, UserId) {
  logger.info('service/activateCoupons', { couponId, UserId });
  const coupon = await Coupon.findOne({ where: { couponId } });
  if (!coupon) return 'coupon not found URL';
  if (coupon.isDone) return 'coupon is done URL';
  const resUrl = await paymentService
    .payForCoupon(UserId, coupon.subscriptionType, coupon.couponId);
  return resUrl;
}

module.exports = activateCoupons;
