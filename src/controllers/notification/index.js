const logger = require('../../helpers/logger');
const setPaymentStatus = require('./setPaymentStatus');
const storeRebillIdForUser = require('./storeRebillIdForUser');

const notificationController = {
  postPaymentNotification: async (ctx) => {
    const { body } = ctx.request;
    const { Success, OrderId, RebillId } = body;
    logger.info('postPaymentNotification', { body });
    try {
      await setPaymentStatus(Success, OrderId);
      if (RebillId) {
        // This is first recurrent payment(init method) we has to save RebuildId
        // for this user.
        // For more information see: https://oplata.tinkoff.ru/landing/develop/documentation/autopayment
        await storeRebillIdForUser(OrderId, RebillId);
      }
      ctx.response.body = 'OK';
      return ctx;
    } catch (err) {
      logger.error('postPaymentNotification', err.message);
      ctx.response.body = 'error';
      ctx.status = 404;
      return ctx;
    }
  },
};

module.exports = notificationController;
