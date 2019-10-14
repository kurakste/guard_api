const models = require('../../models');
const logger = require('../helpers/logger');

const {
  Alarm, Gbr, Track, sequelize,
} = models;
const cpSocketEventEmitter = require('../cpSocketEventEmitter');
const appSocketEventEmitter = require('../appSocketEventEmitter');

// TODO: Write real function)
const getGbrId = () => 32;

const socketController = {

  addNewPosition: async (cpIo, socket, user, data) => {
    logger.info('addNewPosition', { data });
    const { payload } = data;
    const [lat, lon] = payload;

    const myQuery = `SELECT * FROM "Tracks" AS "Track" 
    WHERE 
      "Track"."UserId" = ${user.id} 
      AND "Track"."createdAt">= CURRENT_DATE;
    `;
    try {
      const res = await sequelize.query(myQuery);
      if (res[0].length > 0) {
        // track already created
        if (res[0].length > 1) throw new Error(`More then one active track for UserId: ${user.id}`);
        const { id } = res[0][0];
        const trackObj = await Track.findByPk(id);
        const tmp = trackObj.track;
        tmp.push([lat, lon]);
        trackObj.track = tmp;
        await trackObj.save();
        logger.info('addNewPosition', { msg: 'add new point to track', trackObj });
      } else {
        const track = await Track.build({
          UserId: user.id,
          track: [[lat, lon]],
          isActive: true,
        });
        await track.save();
        logger.info('addNewPosition', { msg: 'created new track', track });
      }
      appSocketEventEmitter.srvAcceptAddNewPosition(socket);
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
      appSocketEventEmitter.srvAcceptCancelAlarm(socket);
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
      appSocketEventEmitter.srvAcceptAddNewPointInAlarmTrack(socket);
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
        appSocketEventEmitter.srvAcceptCancelAlarm(socket);
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


module.exports = socketController;

// ====================== helpers =================================================

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
