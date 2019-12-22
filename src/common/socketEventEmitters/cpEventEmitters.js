const logger = require('../../helpers/logger');
const models = require('../../../models');

const { Alarm, Gbr, User } = models;

const cpSocketEventEmitter = {
  srvNewUserWasCreated: async (socket) => {
    logger.info('srvNewUserWasCreated was emitted');
    socket.emit('srvNewUserWasCreated', {
      result: true,
    });
  },

  srvLoginOk: async (socket, result, user, token) => {
    logger.info(
      'srvNewUserWasCreated was emitted', {
        result, user, token,
      },
    );
    socket.emit('srvLoginOk', {
      token,
      user,
    });
  },

  srvCreateNewAlarm: async (cpIo, alarms) => {
    logger.info(
      'srvCreateNewAlarm was emitted', {
        alarms,
      },
    );
    cpIo.emit('srvCreateNewAlarm', alarms);
  },

  srvUpdateAlarmListAll: async (socket) => {
    logger.info('srvUpdateAlarmListAll was emitted');
    const dataObj = await Alarm
      .findAll({
        where: { status: [0, 10, 20] },
        include: [
          'User',
          { model: Gbr, through: 'GbrsToAlarms' },
        ],
      });
    const alarms = dataObj.map(el => el.dataValues);
    const alarmsForSend = alarms.map(el => {
      const ell = { ...el };
      ell.User.password = null;
      return ell;
    });
    socket.emit('srvUpdateAlarmListAll', alarmsForSend);
  },

  srvUpdateAlarm: async (cpIo, alarm) => {
    logger.info('srvUpdateAlarm was emitted', { alarm });
    cpIo.emit('srvUpdateAlarm', alarm);
  },

  srvUpdateUserList: async (socket, usersList) => {
    logger.info('srvUpdateUserList was emitted', usersList);
    socket.emit('srvUpdateUserList', usersList);
  },

  srvSendAllCpUserListForOneCpUser: async (socket) => {
    logger.info('srvUpdateUserList was emitted');
    const dataObj = await User
      .findAll({
        where: { role: [36, 32, 34] },
      });
    const users = dataObj.map(el => el.dataValues);
    socket.emit('srvSendAllCpUserList', users);
  },

  srvSendAllCpUserListForAllCpUser: async (cpIo) => {
    logger.info('srvSendAllCpUserListForAllCpUser was emitted');
    const dataObj = await User
      .findAll({
        where: { role: [36, 32, 34] },
      });
    const users = dataObj.map(el => el.dataValues);
    cpIo.emit('srvSendAllCpUserList', users);
  },

  srvSendAllAppUserListForOneCpUser: async (socket) => {
    logger.info('srvSendAllAppUserListForOneCpUser was emitted');
    const dataObj = await User
      .findAll({
        where: { role: [35, 31, 33] },
      });
    const users = dataObj.map(el => el.dataValues);
    socket.emit('srvSendAllAppUserList', users);
  },

  srvSendAllAppUserListForAllCpUser: async (cpIo) => {
    logger.info('srvSendAll AppUserListForAllCpUser was emitted');
    const dataObj = await User
      .findAll({
        where: { role: [35, 31, 33] },
      });
    const users = dataObj.map(el => el.dataValues);
    cpIo.emit('srvSendAllAppUserList', users);
  },

  srvUpdatedCpUser: async (cpIo, user) => {
    logger.info('srvUpdatedCpUser was emitted', { user });
    cpIo.emit('srvUpdateCpUser', user);
  },

  srvUpdatedAppUser: async (cpIo, user) => {
    logger.info('srvUpdatedAppUser was emitted', { user });
    cpIo.emit('srvUpdateAppUser', user);
  },

  srvNewUserConnected: async (cpIo, uid) => {
    logger.info('srvNewUserConnected was emitted', { uid });
    cpIo.emit('srvNewUserConnected', uid);
  },

  srvNewUserDisconnected: async (spIo, uid) => {
    logger.info('srvNewUserDisconnected was emitted', { uid });
    spIo.emit('srvNewUserDisconnected', uid);
  },

  srvErrMessage: (socket, code, message) => {
    logger.info('srvErrMessage was emitted', { message });
    socket.emit('srvErrMessage', { message, code });
  },
};

module.exports = cpSocketEventEmitter;
