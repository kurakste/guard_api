const logger = require('../../../../helpers/logger');
const models = require('../../../../../models');
const userRoleWithMessage = require('../../../../common/socketEventEmitters/userRoleWithMessage');
const getOpenAlarm = require('./getOpenAlarm');

const { User } = models;

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

module.exports = srvSendAppState;
