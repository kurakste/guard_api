const getUserFromToken = require('../helpers/getUserFromToken');
const cpSocketEmitter = require('../cpSocketEventEmitter');
const models = require('../../models');

const { Alarm, Gbr } = models;

const cpSocketController = {
  cpPickedUpAlarm: async (cpIo, data) => {
    try {
      const { token, payload } = data;
      const alarm = payload;
      const user = getUserFromToken(token);
      const alarmUpdated = await Alarm.findByPk(alarm.id, {
        include: [
          'User',
          { model: Gbr, through: 'GbrsToAlarms' },
        ],
      });
      alarmUpdated.oid = user.id;
      alarmUpdated.status = 10;
      alarmUpdated.pickedUpAt = new Date();
      alarmUpdated.save();

      console.log('cpPickedUpAlarm: ', alarmUpdated.dataValues);
      cpSocketEmitter.srvUpdateAlarm(cpIo, alarmUpdated);
    } catch (err) {
      console.log(err);
    }
  },
  cpAlarmGbrSent: async (cpIo, data) => {
    try {
      console.log('cpAlarmGbrSent', data);
      const { payload } = data;
      const alarm = payload;
      const alarmUpdated = await Alarm.findByPk(alarm.id, {
        include: [
          'User',
          { model: Gbr, through: 'GbrsToAlarms' },
        ],
      });
      alarmUpdated.groupSendAt = new Date();
      alarmUpdated.status = 20;
      alarmUpdated.save();
      cpSocketEmitter.srvUpdateAlarm(cpIo, alarmUpdated);
    } catch (error) {
      console.log(error);
    }
  },
  cpAlarmClosed: async (cpIo, data) => {
    try {
      console.log('cpAlarmGbrSent', data);
      const { payload } = data;
      const alarm = payload;
      const alarmUpdated = await Alarm.findByPk(alarm.id, {
        include: [
          'User',
          { model: Gbr, through: 'GbrsToAlarms' },
        ],
      });
      alarmUpdated.closedAt = new Date();
      alarmUpdated.status = 40;
      alarmUpdated.save();
      cpSocketEmitter.srvUpdateAlarm(cpIo, alarmUpdated);
    } catch (error) {
      console.log(error);
    }
  },
  
  cpAlarmDecline: async (cpIo, data) => {
    try {
      console.log('cpAlarmGbrSent', data);
      const { payload } = data;
      const alarm = payload;
      const alarmUpdated = await Alarm.findByPk(alarm.id, {
        include: [
          'User',
          { model: Gbr, through: 'GbrsToAlarms' },
        ],
      });
      alarmUpdated.declineAt = new Date();
      alarmUpdated.status = 30;
      alarmUpdated.save();
      cpSocketEmitter.srvUpdateAlarm(cpIo, alarmUpdated);
    } catch (error) {
      console.log(error);
    }
  },

};

module.exports = cpSocketController;
