const models = require('../../models');
const getSocketObject = require('../helpers/socketObject');

const { Alarm, Gbr } = models;

const cpSocketEventEmitter = {
  srvNewUserWasCreated: async (socket, user) => {
    console.log('emited srvNewUserWasCreated');
    socket.emit('srvNewUserWasCreated', {
      token: 'fake token',
      user,
    });
  },

  srvLoginResult: async (socket, result, user, token) => {
    console.log('emited srvLoginResult');
    socket.emit('srvLoginResult', {
      result,
      token,
      user,
    });
  },

  srvCreateNewAlarm: async (cpIo, alarms) => {
    cpIo.socket.emit('srvCreateNewAlarm', getSocketObject(alarms));
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
      return el;
    });
    socket.emit('srvUpdateAlarmListAll', getSocketObject(alarmsForSend));
  },

  srvUpdateAlarm: async (cpIo, alarm) => {
    cpIo.socket.emit('srvUpdateAlarm', alarm);
  },

  srvUpdateUserList: async (socket, usersList) => {
    socket.emit('srvUpdateUserList', usersList);
  },

  srvNewUserConnected: async (spIo, uid) => {
    spIo.socket.emit('srvNewUserConnected', uid);
  },

  srvNewUserDisconnected: async (spIo, uid) => {
    spIo.socket.emit('srvNewUserDisconnected', uid);
  },
};

module.exports = cpSocketEventEmitter;
