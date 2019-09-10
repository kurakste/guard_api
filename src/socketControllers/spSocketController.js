// const models = require('../../models');

// const { Alarm, Gbr } = models;

const cpSocketController = {
  cpPickedUpAlarm: (cpIo, alarm) => {
    console.log('cpPickedUpAlarm: ', alarm);
  },

};

module.exports = cpSocketController;
