const models = require('../../models');

const { Alert, Gbr } = models;

const socketEventEmitter = {
  alertListUpdated: async (cpIo) => {
    const dataObj = await Alert
      .findAll({
        where: { status: 0 },
        include: [
          'User',
          { model: Gbr, through: 'GbrsToAlerts' },
        ],
      });
    console.log('getUser: ', dataObj.dataValues);
    const alarms = dataObj.map(el => el.dataValues);

    cpIo.socket.emit('alertsUpdated', alarms);
  },

  getFreeAlertList: async (socket) => {
    const dataObj = await Alert
      .findAll({
        where: { status: 0 },
        include: [
          'User',
          { model: Gbr, through: 'GbrsToAlerts' },
        ],
      });
    console.log('getUser: ', dataObj.dataValues);
    const alarms = dataObj.map(el => el.dataValues);
    socket.emit('alertsUpdated', alarms);
  },
};

module.exports = socketEventEmitter;
