const models = require('../../models');

const { Alert } = models;

const socketController = {
  newAlert: async (data) => {
    const { payload } = data;
    console.log('new alert: ', JSON.stringify(payload, null, 2));
    const result = await Alert.create(payload);
    const newAlert = result.dataValues;
    

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
    console.log('disconected: ', data);
  },
};

module.exports = socketController;
