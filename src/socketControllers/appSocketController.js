const models = require('../../models');
const logger = require('../helpers/logger');

const { Alarm, Gbr, Track } = models;
const cpSocketEventEmitter = require('../cpSocketEventEmitter');
const appSocketEventEmitter = require('../appSocketEventEmitter');

// TODO: Write real function)
const getGbrId = () => 32;

const socketController = {
  appNewTrack: async (cpIo, socket, user, data) => {
    logger.info('appNewTrack', { data });
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
    logger.info('appNewTrack', { data });
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

  appStopTrack: async (cpIo, socket, user) => {
    try {
      logger.info('appStopTrack', { user: user.id });
      const trackObjArr = await Track.findAll({ UserId: user.id });
      const trackArr = trackObjArr
        .filter(el => el.isActive);
      if (trackArr.length > 1) throw new Error(`More then one active track for UserId: ${user.id}`);
      if (trackArr.length === 0) throw new Error(`No active track found for UserId: ${user.id}`);
      const track = trackArr[0];
      track.isActive = false;
      await track.save();
      appSocketEventEmitter.srvCancelActiveTrack(socket);
    } catch (err) {
      appSocketEventEmitter.srvErrMessage(socket, 500, err.message);
      logger.error(err.message);
    }
  },

  appNewAlarm: async (cpIo, socket, user, data) => {
    try {
      logger.info('appNewAlarm', { data });
      const { payload } = data;
      const isOpen = await hasThisUserOpenAlarm(user.id);
      if (isOpen) throw new Error(`Can't open one more alarm for user: ${user.id}`);
      const [lat, lon] = payload;
      const alarmData = {
        UserId: user.id,
        status: 0,
        track: [[lat, lon]],
      };
      payload.GbrId = getGbrId(alarmData);
      const alarm = await Alarm.create(alarmData);
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
      appSocketEventEmitter.srvAcceptNewAlarm(socket);
      cpSocketEventEmitter.srvCreateNewAlarm(cpIo, newAlarmWithGbr.dataValues);
    } catch (err) {
      appSocketEventEmitter.srvErrMessage(socket, 500, err.message);
      logger.error(err.message);
    }
  },

  appAddNewPointInAlarmTrack: async (cpIo, socket, user, data) => {
    try {
      logger.info('appAddNewPointInAlarmTrack', data);
      const { payload } = data;
      const point = payload;
      const aid = await getOpenAlarmId(user.id);
      if (!aid) throw new Error(`No open alarm was found for user with id: ${user.id}`);
      const alarm = await Alarm.findByPk(aid);
      alarm.track = [...alarm.track, point];
      await alarm.save();
      cpSocketEventEmitter.srvUpdateAlarm(cpIo, alarm.dataValues);
    } catch (err) {
      appSocketEventEmitter.srvErrMessage(socket, 500, err.message);
      logger.error(err.message);
    }
  },

  appCancelAlarm: async (cpIo, socket, user) => {
    logger.info(`appCancelAlarm for user id: ${user.id}`);
    try {
      const isOpen = await hasThisUserOpenAlarm(user.id);
      if (isOpen) {
        const openAlarm = await getOpenAlarmObject(user.id);
        openAlarm.closedAt = Date.now();
        openAlarm.status = 45;
        openAlarm.notes = 'Closed by user';
        openAlarm.save();
        cpSocketEventEmitter.srvUpdateAlarm(cpIo, openAlarm.dataValues);
        appSocketEventEmitter.srvCancelActiveAlarm(socket);
      } else {
        const msg = 'Open alarm not found.';
        appSocketEventEmitter.srvErrMessage(socket, 500, msg);
        logger.error(msg);
      }
    } catch (err) {
      appSocketEventEmitter.srvErrMessage(socket, 500, err.message);
      logger.error(err.message);
    }
  },


  disconnect: (data) => {
    logger.info('disconnected: ', data);
  },
};

async function getOpenAlarmObject(userId) {
  const alarms = await Alarm.findAll({
    where: {
      UserId: userId, closedAt: null,
    },
  });
  if (alarms.length > 1) throw new Error(`More then one open alarm for user with id : ${userId}`);
  if (alarms.length === 0) return null;
  return alarms[0];
}

module.exports = socketController;

// ====================== helpers =================================================

async function getOpenAlarmId(userId) {
  const alarms = await Alarm.findAll({
    where: {
      UserId: userId, closedAt: null,
    },
  });
  if (alarms.length > 1) throw new Error(`More then one open alarm for user with id : ${userId}`);
  if (alarms.length === 0) return null;
  return alarms[0].id;
}

async function hasThisUserOpenAlarm(userId) {
  const alarms = await Alarm.findAll({
    where: {
      UserId: userId, closedAt: null,
    },
  });
  if (alarms.length > 0) return true;
  return false;
}
