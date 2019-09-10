const models = require('../../models');
const getSocketObject = require('../helpers/socketObject');

const { Alarm, Gbr } = models;

const cpSocketEventEmitter = {
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

  cpPickedUpAlarm: async (cpIo, alarm) => {

  },
};

module.exports = cpSocketEventEmitter;
