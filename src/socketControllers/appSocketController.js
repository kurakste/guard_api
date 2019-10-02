const models = require('../../models');
const logger = require('../helpers/logger');

const { Alarm, Gbr, Track } = models;
const cpSocketEventEmitter = require('../cpSocketEventEmitter');
const appSocketEventEmitter = require('../appSocketEventEmitter');

// TODO: Write real function)
const getGbrId = () => 32;

const socketController = {
  appNewTrack: async (cpIo, socket, user, data) => {
    try {
      const { payload } = data;
      const [lat, lon] = payload;

      const trackObjArr = await Track.findAll({ UserId: user.id });
      const trackArr = trackObjArr
        .filter(el => el.isActive);
      if (trackArr.length > 0) throw new Error(`Can't open one more track for UserId: ${user.id}`);
    
      logger.info('appNewTrack', { user: user.id });
      const track = await Track.build({
        UserId: user.id,
        track: [[lat, lon]],
        isActive: true,
      });
      await track.save();
      appSocketEventEmitter.srvAcceptNewTrack(socket, track.id);
    } catch (err) {
      appSocketEventEmitter.srvErrMessage(socket, 500, err.message);
      logger.error(err);
    }
  },

  appTrackAddPoint: async (cpIo, socket, user, data) => {
    try {
      const { payload } = data;
      const [lat, lon] = payload;
      logger.info('appTrackAddPoint', { user: user.id });
      const trackObjArr = await Track.findAll({ UserId: user.id });
      const trackArr = trackObjArr
        .filter(el => el.isActive);
      if (trackArr.length > 1) throw new Error(`More then one active track for UserId: ${user.id}`);
      if (trackArr.length === 0) throw new Error(`No active track found for UserId: ${user.id}`);
      const track = trackArr[0];
      const tmp = [...track.track];
      tmp.push([lat, lon]);
      track.track = [...tmp];
      await track.save();
    } catch (err) {
      appSocketEventEmitter.srvErrMessage(socket, 500, err.message);
      logger.error(err.message);
    }
  },

  appStopTrack: async (cpIo, socket, user, data) => {
    try {
      //const { payload } = data;
      logger.info('appStopTrack', { user: user.id });
      const trackObjArr = await Track.findAll({ UserId: user.id });
      const trackArr = trackObjArr
        .filter(el => el.isActive);
      if (trackArr.length > 1) throw new Error(`More then one active track for UserId: ${user.id}`);
      if (trackArr.length === 0) throw new Error(`No active track found for UserId: ${user.id}`);
      const track = trackArr[0];
      track.isActive = false;
      await track.save();
    } catch (err) {
      appSocketEventEmitter.srvErrMessage(socket, 500, err.message);
      logger.error(err.message);
    }
  },

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
      appSocketEventEmitter.srvErrMessage(socket, 500, err.message);
      logger.error(err.message);
    }
  },

  appNewPointInAlarmTrack: async (cpIo, socket, data) => {
    try {
      logger.error('track update: ', data);
      const { payload } = data;
      const { aid, point } = payload;
      const alarm = await Alarm.findByPk(aid);
      alarm.track = [...alarm.track, point];
      await alarm.save();
      cpSocketEventEmitter.srvUpdateAlarm(cpIo, alarm.dataValues);
    } catch (err) {
      appSocketEventEmitter.srvErrMessage(socket, 500, err.message);
      logger.error(err.message);
    }
  },


  disconnect: (data) => {
    logger.info('disconnected: ', data);
  },
};

module.exports = socketController;
