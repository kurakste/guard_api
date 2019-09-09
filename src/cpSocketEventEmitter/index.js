const models = require('../../models');

const { Alarm, Gbr } = models;

const socketEventEmitter = {
  alarmListUpdated: async (cpIo) => {
    const dataObj = await Alarm
      .findAll({
        where: { status: 0 },
        include: [
          'User',
          { model: Gbr, through: 'GbrsToAlarms' },
        ],
      });
    console.log('getUser: ', dataObj.dataValues);
    const alarms = dataObj.map(el => el.dataValues);

    cpIo.socket.emit('alarmsUpdated', alarms);
  },

  getFreeAlarmList: async (socket) => {
    const dataObj = await Alarm
      .findAll({
        where: { status: 0 },
        include: [
          'User',
          { model: Gbr, through: 'GbrsToAlarms' },
        ],
      });
    console.log('getUser: ', dataObj.dataValues);
    const alarms = dataObj.map(el => el.dataValues);
    socket.emit('alarmsUpdated', alarms);
  },
};

module.exports = socketEventEmitter;
