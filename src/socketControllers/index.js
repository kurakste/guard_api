const models = require('../../models');

const { Alert, Gbr } = models;

const socketController = {
  newAlert: async (cpIo, data) => {
    // console.log('cpIo: ', cpIo);
    const { payload } = data;
    payload.GbrId = 1;
    console.log('new alert: ', JSON.stringify(payload, null, 2));
    const result = await Alert.create(payload);
    const newAlert = result.dataValues;

    const gbr = await Gbr.findAll({ where: { regionId: 1 } });

    await result.addGbr(gbr);

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

  trackUpdate: (data) => {
    console.log('track update: ', data);
  },

  alertInWork: (data) => {
    console.log('alert in work: ', data);
  },

  gbrSent: (data) => {
    console.log('gbr sent: ', data);
  },

  alertDecline: (data) => {
    console.log('alertDecline: ', data);
  },

  alertClose: (data) => {
    console.log('alert Close : ', data);
  },

  disconnect: (data) => {
    console.log('disconnected: ', data);
  },
};

module.exports = socketController;
