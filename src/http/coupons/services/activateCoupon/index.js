require('dotenv').config();
const logger = require('../../../../helpers/logger');
const models = require('../../../../../models');
const paymentService = require('../../../../common/paymentService');

const { Coupon } = models;
const apiUrl = process.env.API_URL;

async function activateCoupons(couponId, UserId) {
  logger.info('service/activateCoupons', { couponId, UserId });
  const coupon = await Coupon.findOne({ where: { couponId } });
  if (!coupon) return `${apiUrl}/coupon-not-found`;
  if (coupon.isDone) return `${apiUrl}/coupon-done`;
  const resUrl = await paymentService
    .payForCoupon(UserId, coupon.subscriptionType, coupon.couponId);
  return resUrl;
}

module.exports = activateCoupons;
