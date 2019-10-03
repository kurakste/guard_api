const Sequelize = require('sequelize');
const models = require('../../models');

const { Op } = Sequelize;
const { Alarm, Track } = models;

const appSocketEventEmitter = {

  srvErrMessage: (socket, code, message) => {
    socket.emit('srvErrMessage', { message, code });
  },

  srvAcceptNewTrack: (socket, tid) => {
    socket.emit('srvAcceptNewTrack', { tid });
  },

  srvCancelActiveTrack: (socket, tid) => {
    socket.emit('srvCancelActiveTrack', { tid });
  },

  srvAcceptNewAlarm: (socket) => {
    socket.emit('srvAcceptNewAlarm');
  },

  srvCancelActiveAlarm: (socket) => {
    socket.emit('srvCancelActiveAlarm');
  },

  srvSendAppState: async (socket, user) => {
    const openTrack = await getOpenTrack(user);
    const openAlarm = await getOpenAlarm(user);
    const alarmHistory = await getAlarmHistory(user);

    socket.emit('srvSendAppState', {
      user, openTrack, openAlarm, alarmHistory,
    });
  },
};

async function getOpenTrack(user) {
  const track = await Track.findOne({
    where: {
      UserId: user.id,
      isActive: true,
    },
  });
  const out = track ? track.dataValues : null;
  return out;
}

async function getOpenAlarm(user) {
  const alarm = await Alarm.findOne({
    where: {
      UserId: user.id,
      status: {
        [Op.lt]: 10,
      },
    },
  });
  const out = alarm ? alarm.dataValues : null;
  return out;
}

async function getAlarmHistory(user) {
  const alarms = await Alarm.findAll({
    where: {
      UserId: user.id,
      status: {
        [Op.gt]: 0,
      },
    },
  });
  const out = alarms ? alarms.map(el => el.dataValues) : null;
  return out;
}

module.exports = appSocketEventEmitter;
