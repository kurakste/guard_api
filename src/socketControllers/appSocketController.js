const models = require('../../models');

const { Alarm, Gbr } = models;
const cpSocketEventEmitter = require('../cpSocketEventEmitter');
// const appSocketEventEmitter = require('../appSocketEventEmitter');

const getGbrId = () => 32;

const socketController = {
  appNewAlarm: async (cpIo, socket, data) => {
    try {
      const { payload } = data;
      payload.GbrId = getGbrId(payload);
      const alarm = await Alarm.create(payload);
      const gbr = await Gbr.findAll({ where: { regionId: getGbrId() } });
      await alarm.addGbr(gbr);
      const newAlarmWithGbr = await Alarm.findOne({
        where: { id: alarm.id },
        include: [
          'User',
          { model: Gbr, through: 'GbrsToAlarms' },
        ],
      });
      newAlarmWithGbr.User.password = null;
      cpSocketEventEmitter.srvCreateNewAlarm(cpIo, newAlarmWithGbr.dataValues);
    } catch (err) {
      console.log(err);
    }
  },

  appNewPointInTrack: async (cpIo, data) => {
    try {
      console.log('track update: ', data);
      const { payload } = data;
      const { aid, point } = payload;
      const alarm = await Alarm.findByPk(aid);
      alarm.track = [...alarm.track, point];
      await alarm.save();
      cpSocketEventEmitter.srvUpdateAlarm(cpIo, alarm.dataValues);
    } catch (err) {
      console.log(err);
    }
  },


  disconnect: (data) => {
    console.log('disconnected: ', data);
  },
};

module.exports = socketController;
