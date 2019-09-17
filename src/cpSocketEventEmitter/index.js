const models = require('../../models');
const getSocketObject = require('../helpers/socketObject');

const { Alarm, Gbr } = models;

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
    cpIo.emit('srvCreateNewAlarm', getSocketObject(alarms));
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
    socket.emit('srvUpdateAlarmListAll', getSocketObject(alarmsForSend));
  },

  srvUpdateAlarm: async (cpIo, alarm) => {
    cpIo.emit('srvUpdateAlarm', alarm);
  },

  srvUpdateUserList: async (socket, usersList) => {
    socket.emit('srvUpdateUserList', usersList);
  },

  srvNewUserConnected: async (cpIo, uid) => {
    cpIo.emit('srvNewUserConnected', uid);
  },

  srvNewUserDisconnected: async (spIo, uid) => {
    spIo.emit('srvNewUserDisconnected', uid);
  },
};

module.exports = cpSocketEventEmitter;
