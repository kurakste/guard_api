const models = require('../../models');

const { Alert, User } = models;

const socketController = {
  newAlert: async (cpIo, data) => {
    // console.log('cpIo: ', cpIo);
    const { payload } = data;
    console.log('new alert: ', JSON.stringify(payload, null, 2));
    const result = await Alert.create(payload);
    const newAlert = result.dataValues;
    // await Alert.hasOne(User, { foreignKey: 'uid' });


    const dataObj = await Alert.findAll({ where: { status: 0 }, include: ['User'] });
    // console.log('getUser: ', dataObj);
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
