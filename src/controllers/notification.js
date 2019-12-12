const Sequelize = require('sequelize');
const { connectedUsers } = require('../socketApi');
const logger = require('../helpers/logger');
const models = require('../../models');
const userRoleWithMessage = require('../socketEventEmitters/userRoleWithMessage');

const { Bill, User, Alarm } = models;
const { Op } = Sequelize;

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

async function setPaymentStatus(status, orderId) {
  logger.info('setPaymentStatus: ', { status, orderId });
  try {
    const bill = await Bill.findByPk(orderId);
    if (!bill) throw Error(`Bill with id: ${orderId} not found`);
    if (bill) {
      bill.isPaymentFinished = status;
      await bill.save();
      if (bill.operationType === 'subscriptionPayment') {
        await updateSubscriptionStatus(bill.UserId, bill.subscriptionId);
        sendMessageForUser(bill.UserId, 'Платежи', 'Ваша подписка была успешно оплачена.');
      }
    }
  } catch (error) {
    logger.error('setPaymentStatus: ', { msg: error.message });
  }
}

async function storeRebillIdForUser(OrderId, rebillId) {
  const userId = await getUserIdByOrderId(OrderId);
  const user = await User.findByPk(userId);
  if (!user) {
    throw new Error(
      `User with id: ${userId} not found. Check integrity of database. `,
    );
  }
  user.rebillId = rebillId;
  await user.save();
  return true;
}

async function getUserIdByOrderId(orderId) {
  const order = await Bill.findByPk(orderId);
  if (!order) throw new Error(`Order with id: ${orderId} not found.`);
  return order.UserId;
}

async function updateSubscriptionStatus(userId, subscriptionId) {
  const user = await User.findByPk(userId);
  if (!user) {
    logger.error('Not found user in updateSubscriptionStatus', { userId });
    return false;
  }
  user.subscriptionId = subscriptionId;
  user.isSubscribeActive = true;
  user.subscriptionStartsAt = Date.now();
  await user.save();
  return true;
}

function sendMessageForUser(userId, title, message) {
  logger.info('sendMessageForUser', { userId, title, message });
  if (!connectedUsers) {
    logger.error('sendMessageForUser: ', userId, title, message);
    return false;
  }
  const user = connectedUsers.find(el => el.userId === userId);
  if (!user) {
    logger.error('sendMessageForUser user not found', { userId, title, message });
    return false;
  }
  const { socket } = user;
  // socket.emit('srvAlertMessage', {
  //   title, message,
  // });
  srvSendAppState(socket, { id: userId, role: 35, isSubscribeActive: true });
  return true;
}

async function srvSendAppState(socket, user) {
  logger.info('srvSendAppState', { user });
  const { id } = user;
  const userFromDb = await User.findByPk(id);
  const { role } = userFromDb;
  const appUser = (role === 35 || role === 33 || role === 31);
  let message = '';
  if (appUser) {
    if (user.role === 35) {
      message = (user.isSubscribeActive)
        ? 'Приложение готово к работе'
        : userRoleWithMessage[user.role].message;
    } else {
      message = userRoleWithMessage[user.role].message;
    }
    const alarm = await getOpenAlarm(user);
    if (alarm) message = 'У вас открыта тревога. Ее обрабатывают операторы.';
    socket.emit('srvSendAppState', {
      user: userFromDb, serviceStatus: message, openAlarm: alarm,
    });
  } else {
    logger.error(`srvSendAppState: user with id: ${id} is not valid app user`);
  }
}

async function getOpenAlarm(user) {
  const alarm = await Alarm.findOne({
    where: {
      UserId: user.id,
      status: {
        [Op.lt]: 30,
      },
    },
  });
  const out = alarm ? alarm.dataValues : null;
  return out;
}
