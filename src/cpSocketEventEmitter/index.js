const models = require('../../models');

const { Alarm, Gbr, User } = models;

const cpSocketEventEmitter = {
  srvNewUserWasCreated: async (socket) => {
    socket.emit('srvNewUserWasCreated', {
      result: true,
    });
  },

  srvLoginOk: async (socket, result, user, token) => {
    socket.emit('srvLoginOk', {
      token,
      user,
    });
  },

  srvCreateNewAlarm: async (cpIo, alarms) => {
    cpIo.emit('srvCreateNewAlarm', alarms);
  },

  srvUpdateAlarmListAll: async (socket) => {
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
    cpIo.emit('srvUpdateAlarm', alarm);
  },

  srvUpdateUserList: async (socket, usersList) => {
    socket.emit('srvUpdateUserList', usersList);
  },

  srvSendAllCpUserListForOneCpUser: async (socket) => {
    const dataObj = await User
      .findAll({
        where: { role: [36, 32, 34] },
      });
    const users = dataObj.map(el => el.dataValues);
    socket.emit('srvSendAllCpUserList', users);
  },

  srvSendAllCpUserListForAllCpUser: async (cpIo) => {
    const dataObj = await User
      .findAll({
        where: { role: [36, 32, 34] },
      });
    const users = dataObj.map(el => el.dataValues);
    cpIo.emit('srvSendAllCpUserList', users);
  },

  srvSendAllAppUserListForOneCpUser: async (socket) => {
    const dataObj = await User
      .findAll({
        where: { role: [35, 31, 33] },
      });
    const users = dataObj.map(el => el.dataValues);
    socket.emit('srvSendAllAppUserList', users);
  },

  srvSendAllAppUserListForAllCpUser: async (cpIo) => {
    const dataObj = await User
      .findAll({
        where: { role: [35, 31, 33] },
      });
    const users = dataObj.map(el => el.dataValues);
    cpIo.emit('srvSendAllAppUserList', users);
  },

  srvUpdatedCpUser: async (cpIo, user) => {
    cpIo.emit('srvUpdateCpUser', user);
  },

  srvUpdatedAppUser: async (cpIo, user) => {
    cpIo.emit('srvUpdateAppUser', user);
  },

  srvNewUserConnected: async (cpIo, uid) => {
    cpIo.emit('srvNewUserConnected', uid);
  },

  srvNewUserDisconnected: async (spIo, uid) => {
    spIo.emit('srvNewUserDisconnected', uid);
  },

  srvErrMessage: (socket, code, message) => {
    socket.emit('srvErrMessage', { message, code });
  },
};

module.exports = cpSocketEventEmitter;
