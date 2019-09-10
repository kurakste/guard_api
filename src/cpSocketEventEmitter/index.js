const models = require('../../models');

const { Alarm, Gbr } = models;

const cpSocketEventEmitter = {
  srvCreateNewAlarm: async (cpIo, alarms) => {
    cpIo.socket.emit('srvCreateNewAlarm', alarms);
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
    socket.emit('srvUpdateAlarmListAll', alarmsForSend);
  },
};

module.exports = cpSocketEventEmitter;
