const logger = require('../../../../helpers/logger');
const models = require('../../../../../models');

const { Coupon } = models;

async function activateCoupons(couponId, UserId) {
  logger.info('service/activateCoupons', { couponId, UserId });
  const coupon = await Coupon.findOne({ where: { couponId } });
  if (!coupon) return 'not found';
  if (coupon.isDone) return 'coupon is done';
  // create bill record.
  // send pay one rub page.
  // wait for notification.
  console.log('----------------');
  return true;
}

module.exports = activateCoupons;
