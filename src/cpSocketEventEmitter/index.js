const models = require('../../models');

const { alarm, Gbr } = models;

const socketEventEmitter = {
  alarmListUpdated: async (cpIo) => {
    const dataObj = await alarm
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

  getFreealarmList: async (socket) => {
    const dataObj = await alarm
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
