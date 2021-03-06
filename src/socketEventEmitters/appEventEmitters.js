const Sequelize = require('sequelize');
const models = require('../../models');
const userRoleWithMessage = require('./userRoleWithMessage');
const logger = require('../helpers/logger');

const { Op } = Sequelize;
const { Alarm } = models;

const appSocketEventEmitter = {

  // srvHearBeatResponse: (socket) => {
  //   socket.emit('srvHearBeatResponse', { message: 'ok' });
  // },

  srvErrMessage: (socket, code, message) => {
    logger.info('srvErrMessage', code, message);
    socket.emit('srvErrMessage', { message, code });
  },

  srvAcceptAddNewPosition: (socket) => {
    logger.info('srvAcceptAddNewPosition');
    socket.emit('srvAcceptAddNewPosition');
  },

  srvAcceptNewAlarm: (socket, data) => {
    socket.emit('srvAcceptNewAlarm', data);
  },

  srvAcceptCancelAlarm: (socket) => {
    logger.info('srvAcceptCancelAlarm');
    socket.emit('srvAcceptCancelAlarm');
  },

  sendUserMessage: (socket, title, message) => {
    logger.info('srvErrMessage', title, message);
    socket.emit('srvAlertMessage', {
      title, message,
    });
  },

  srvSendAppState: async (socket, user) => {
    logger.info('srvSendAppState', user);
    const { role, id } = user;
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
        user, serviceStatus: message, openAlarm: alarm,
      });
    } else {
      logger.error(`srvSendAppState: user with id: ${id} is not valid app user`);
    }
  },

};

// async function getOpenTrack(user) {
//   const track = await Track.findOne({
//     where: {
//       UserId: user.id,
//       isActive: true,
//     },
//   });
//   const out = track ? track.dataValues : null;
//   return out;
// }

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

// async function getAlarmHistory(user) {
//   const alarms = await Alarm.findAll({
//     where: {
//       UserId: user.id,
//       status: {
//         [Op.gt]: 0,
//       },
//     },
//   });
//   const out = alarms ? alarms.map(el => el.dataValues) : null;
//   return out;
// }

module.exports = appSocketEventEmitter;
