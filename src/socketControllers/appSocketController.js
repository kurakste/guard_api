const decoder = require('google-geo-decoder');
const models = require('../../models');
const logger = require('../helpers/logger');
const paymentService = require('../services/payment.service');

const {
  Alarm, Gbr, Track, sequelize,
} = models;
const cpSocketEventEmitter = require('../socketEventEmitters/cpEventEmitters');
const appSocketEventEmitter = require('../socketEventEmitters/appEventEmitters');

const socketController = {

  addNewPosition: async (cpIo, socket, user, data) => {
    // logger.info('addNewPosition', { user: user.id });
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
        logger.info('addNewPosition', { msg: 'add new point to track' });
      } else {
        const track = await Track.build({
          UserId: user.id,
          track: [[lat, lon]],
          isActive: true,
        });
        await track.save();
        logger.info('addNewPosition', { msg: 'created new track', track });
      }
      await addPointToOpenedAlarm(user.id, [lat, lon]);
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
      const { isSubscribeActive } = user;
      if (!isSubscribeActive) {
        appSocketEventEmitter.sendUserMessage(socket, 'Для того, что бы вызов экстренных служб работал нужно выбрать подписку и оплатить ее.');
        return null;
      }
      const isOpen = await hasThisUserOpenAlarm(user.id);
      if (isOpen) throw new Error(`Can't open one more alarm for user: ${user.id}`);
      const [lat, lon] = payload;
      const [regionId, address] = await getRegionIdAndAddress(lat, lon, socket);
      let isPaid = false;
      if (regionId !== 0) {
        // if region id is 0 - we have no one GBR in the region and don't have to get money.
        isPaid = await paymentService.payForSecurityCall(user.id);
      }
      const alarmData = {
        UserId: user.id,
        status: 0,
        track: [[lat, lon]],
        address,
        callIsPaid: isPaid,
      };
      const alarm = await Alarm.create(alarmData);
      const gbr = await Gbr.findAll({ where: { regionId } });
      await alarm.addGbr(gbr);

      const newAlarmWithGbr = await Alarm.findOne({
        where: { id: alarm.id },
        include: [
          'User',
          { model: Gbr, through: 'GbrsToAlarms' },
        ],
      });
      newAlarmWithGbr.User.password = null;
      appSocketEventEmitter.srvAcceptNewAlarm(socket, newAlarmWithGbr.dataValues);
      cpSocketEventEmitter.srvCreateNewAlarm(cpIo, newAlarmWithGbr.dataValues);
      if (isPaid) {
        appSocketEventEmitter.sendUserMessage(socket, 'Тревога принята в обработку. Ожидайте.');
      } else if (regionId !== 0) {
        appSocketEventEmitter.sendUserMessage(socket, 'Тревога принята, но мы не получили оплату. Сейчас с вами свяжется оператор и мы решим как поступить.');
      } else {
        appSocketEventEmitter.sendUserMessage(socket, 'Тревога принята, в этом регионе нет наших ГБР. Мы сейчас с вами свяжемся и решим что делать.');
      }
    } catch (err) {
      appSocketEventEmitter.srvErrMessage(socket, 500, err.message);
      logger.error(err.message);
    }
    return null;
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

  appHeartBeat: (socket, user) => {
    // appSocketEventEmitter.srvHearBeatResponse(socket);
    logger.info('appHeartBeat from user', { id: user.id });
  },

  disconnect: (userId, connectedUsers) => {
    // const { socket } = connectedUsers.find(el => el.userId === userId);
    const indx = connectedUsers.findIndex(el => el.userId === userId);
    connectedUsers.splice(indx, 1);
    logger.info(`User ${userId} disconnected. I see ${connectedUsers.length} in system`);
  },
};


module.exports = socketController;

// ====================== helpers =================================================

async function getRegionIdAndAddress(lon, lat, socket) {
  logger.info('getRegionIdAndAddress', { lon, lat });
  const key = process.env.GGKEY;
  try {
    const geoData = await decoder(lon, lat, key);
    const {
      postalCode,
      country,
      lev1,
      lev2,
      lev3,
      route,
      streetNumber,
    } = geoData;
    const address = `${country}, ${postalCode}, ${lev1}, ${lev2}, ${lev3}, ${route}, ${streetNumber}`;
    const gbrs = await Gbr.findAll({ where: { regionName: lev1 } });
    if (!gbrs.length) return [0, address]; // gbrs not found in this region;
    return [gbrs[0].regionId, address]; // All gbrs with one regionName must have common region id;
  } catch (err) {
    appSocketEventEmitter.srvErrMessage(socket, 500, err.message);
    logger.error(err.message);
  }
  return [0, 0];
}

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

async function hasThisUserOpenAlarm(userId) {
  const alarms = await Alarm.findAll({
    where: {
      UserId: userId, closedAt: null,
    },
  });
  if (alarms.length > 0) return true;
  return false;
}
/**
 *
 * @param {number} userId
 * @param {number[lat, lng]} point
 */
async function addPointToOpenedAlarm(userId, point) {
  logger.info('addPointToOpenedAlarm', { userId, point });
  const alarm = await getOpenAlarmObject(userId);
  if (!alarm) return null;
  const tmp = [...alarm.track];
  tmp.push(point);
  alarm.track = tmp;
  await alarm.save();
  return true;
}
