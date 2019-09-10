const models = require('../../models');

const { Alarm, Gbr } = models;
const cpSocketEventEmitter = require('../cpSocketEventEmitter');
// const appSocketEventEmitter = require('../appSocketEventEmitter');

const getGbrId = () => 32;

const socketController = {
  appNewAlarm: async (cpIo, socket, data) => {
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
    // appSocketEventEmitter.appAlarmWasRegistered(socket, newAlarm);
    cpSocketEventEmitter.srvCreateNewAlarm(cpIo, newAlarmWithGbr.dataValues);
  },

  appNewPointInTrack: async (cpIo, data) => {
    try {
      console.log('track update: ', data);
      const { payload } = data;
      const { aid, point } = payload;
      const alarm = await Alarm.findByPk(aid);
      alarm.track = [...alarm.track, point];
      await alarm.save();
    
      console.log(alarm.dataValues);
      cpSocketEventEmitter.srvUpdateAlarm(cpIo, alarm.dataValues);

      //   { track: alarm.track },
      //   {
      //     where: { id: alarm.id },
      //   },
      // );
      //   console.log('res: ', res);
      //   const AlarmFromDb = await Alarm.findByPk(Alarm.id);
      //   console.log('AlarmFromDb.status: ', AlarmFromDb.status);
      //   if (AlarmFromDb.status === 0) cpSocketEventEmitter.AlarmListUpdated(cpIo);
      //   if (AlarmFromDb.status === 1) console.log('update track in Alarm with status 1');
    } catch (err) {
      console.log(err);
    }
  },

  AlarmInWork: (data) => {
    console.log('Alarm in work: ', data);
  },

  gbrSent: (data) => {
    console.log('gbr sent: ', data);
  },

  AlarmDecline: (data) => {
    console.log('AlarmDecline: ', data);
  },

  AlarmClose: (data) => {
    console.log('Alarm Close : ', data);
  },

  disconnect: (data) => {
    console.log('disconnected: ', data);
  },
};

module.exports = socketController;
