const models = require('../../models');

const { Alert, Gbr } = models;
const cpSocketEventEmitter = require('../cpSocketEventEmitter');
const appSocketEventEmitter = require('../appSocketEventEmitter');

const getGbrId = () => 1;

const socketController = {
  newAlert: async (cpIo, socket, data) => {
    const { payload } = data;
    payload.GbrId = getGbrId(payload);
    console.log('new alert: ', JSON.stringify(payload, null, 2));
    const result = await Alert.create(payload);
    const newAlert = result.dataValues;
    const gbr = await Gbr.findAll({ where: { regionId: payload.GbrId } });
    await result.addGbr(gbr);
    appSocketEventEmitter.alertWasRegistered(socket, newAlert);
    cpSocketEventEmitter.alertListUpdated(cpIo);
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
