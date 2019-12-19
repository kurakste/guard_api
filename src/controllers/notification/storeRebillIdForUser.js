const models = require('../../../models');
const logger = require('../../helpers/logger');

const { Bill, User } = models;

async function storeRebillIdForUser(OrderId, rebillId) {
  try {
    const userId = await getUserIdByOrderId(OrderId);
    const user = await User.findByPk(userId);
    if (!user) {
      throw new Error(
        `User with id: ${userId} not found. Check integrity of database. `,
      );
    }
    await User.update(
      { rebillId },
      { where: { email: user.email } },
    );
  } catch (error) {
    logger.error('getUserIdByOrderId: ', { msg: error.message });
  }
  return true;
}

async function getUserIdByOrderId(orderId) {
  const order = await Bill.findByPk(orderId);
  if (!order) throw new Error(`Order with id: ${orderId} not found.`);
  return order.UserId;
}

module.exports = storeRebillIdForUser;
