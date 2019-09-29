const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cpSocketEmitter = require('../cpSocketEventEmitter');
const models = require('../../models');
const logger = require('../helpers/logger');

const { Alarm, Gbr, User } = models;

const cpSocketController = {

  cpRegisterNewCpUser: async (cpIo, socket, data) => {
    const { payload } = data;
    const userFromFront = { ...payload };
    const {
      firstName, lastName, email, tel, password,
    } = userFromFront;
    const cryptPassword = await bcrypt.hash(password, 10);
    const user = {
      firstName, lastName, email, tel, password: cryptPassword, role: 32, active: false,
    };

    try {
      const checkUserInDb = await User.findOne({
        where: { email: user.email },
      });

      if (checkUserInDb) throw new Error('User with this email already exist.');
      const result = await User.create(user);
      logger.info('user: ', result.dataValues);
      delete result.dataValues.password;
      cpSocketEmitter.srvNewUserWasCreated(socket, result.dataValues);
      cpSocketEmitter.srvSendAllAppUserListForAllCpUser(cpIo, result.dataValues);
    } catch (err) {
      socket.emit('errMessage', err.message);
      cpSocketEmitter.srvErrMessage(socket, 1, err.message);
      logger.error(err);
    }
  },

  cpAppUserApprove: async (socket, cpIo, data) => {
    const { payload } = data;
    const user = payload;
    logger.info('cpAppUserApprove', user);
    const { id } = user;
    try {
      const [updated] = await User.update({ role: 35 }, { where: { id } });
      if (updated === 0) throw new Error('Record not found in DB.');
      const updatedUser = await User.findByPk(id);
      const newUser = updatedUser.dataValues;
      cpIo.emit('srvUpdateOneCpUser', newUser);
    } catch (err) {
      logger.error(err.message);
      cpSocketEmitter.srvErrMessage(socket, 11, err.message);
    }
  },

  cpAppUserDecline: async (socket, cpIo, data) => {
    const { payload } = data;
    const user = payload;
    logger.info('cpAppUserDecline', user);
    const { id } = user;
    try {
      const [updated] = await User.update({ role: 33 }, { where: { id } });
      if (updated === 0) throw new Error('Record not found in DB.');
      const updatedUser = await User.findByPk(id);
      const newUser = updatedUser.dataValues;
      cpIo.emit('srvUpdateOneCpUser', newUser);
    } catch (err) {
      logger.error(err.message);
      cpSocketEmitter.srvErrMessage(socket, 11, err.message);
    }
  },

  cpCpUserApprove: async (socket, cpIo, data) => {
    const { payload } = data;
    const user = payload;
    logger.info('cpCpUserApprove', user);
    const { id } = user;
    try {
      const [updated] = await User.update({ role: 36 }, { where: { id } });
      if (updated === 0) throw new Error('Record not found in DB.');
      const updatedUser = await User.findByPk(id);
      const newUser = updatedUser.dataValues;
      cpIo.emit('srvUpdateOneCpUser', newUser);
    } catch (err) {
      logger.error(err.message);
      cpSocketEmitter.srvErrMessage(socket, 11, err.message);
    }
  },

  cpCpUserDecline: async (socket, cpIo, data) => {
    const { payload } = data;
    const user = payload;
    logger.info('cpCpUserDecline', user);
    const { id } = user;
    try {
      const [updated] = await User.update({ role: 34 }, { where: { id } });
      if (updated === 0) throw new Error('Record not found in DB.');
      const updatedUser = await User.findByPk(id);
      const newUser = updatedUser.dataValues;
      cpIo.emit('srvUpdateOneCpUser', newUser);
    } catch (err) {
      logger.error(err.message);
      cpSocketEmitter.srvErrMessage(socket, 11, err.message);
    }
  },

  cpSignIn: async (socket, data) => {
    const { payload } = data;
    const user = payload;
    logger.info('cpSignIn: ', user);
    try {
      const userFromDb = await User.findOne({
        where: { email: user.email },
      });
      logger.info('User from signIn: ', userFromDb.password);
      const loginResult = await bcrypt
        .compare(user.password, userFromDb.password);
      logger.info('login result: ', loginResult);
      if (!loginResult) throw new Error('Login error');
      if (!userFromDb.active) {
        const msg = 'User doesn\'t active. Contact the server administrator';
        cpSocketEmitter.srvErrMessage(socket, 8, msg);
        return;
      }
      const userForSend = { ...userFromDb.dataValues };
      if (!process.env.JWT_KEY) throw new Error('JWT key not exist');
      const token = jwt.sign(
        userForSend,
        process.env.JWT_KEY,
        { expiresIn: '96h' },
      );
      delete userForSend.password;
      cpSocketEmitter.srvLoginOk(socket, loginResult, userForSend, token);
      cpSocketEmitter.srvUpdateAlarmListAll(socket);
    } catch (err) {
      logger.error('errMessage: ', err);
      cpSocketEmitter.srvErrMessage(socket, 6, err.message);
    }
  },

  cpPickedUpAlarm: async (cpIo, socket, user, data) => {
    try {
      const { payload } = data;
      const alarm = { ...payload };
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

      logger.info('cpPickedUpAlarm: ', alarmUpdated.dataValues);
      cpSocketEmitter.srvUpdateAlarm(cpIo, alarmUpdated);
    } catch (err) {
      logger.error(err.message);
      cpSocketEmitter.srvErrMessage(socket, 20, err.message);
    }
  },
  cpAlarmGbrSent: async (cpIo, socket, data) => {
    try {
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
    } catch (err) {
      logger.error(err);
      cpSocketEmitter.srvErrMessage(socket, 30, err.message);
    }
  },
  cpAlarmClosed: async (cpIo, socket, data) => {
    try {
      logger.info('cpAlarmClosed', data);
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
    } catch (err) {
      logger.error(err);
      cpSocketEmitter.srvErrMessage(socket, 40, err.message);
    }
  },
  cpAlarmDecline: async (cpIo, socket, data) => {
    try {
      logger.info('cpAlarmDecline', data);
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
    } catch (err) {
      logger.error(err);
      cpSocketEmitter.srvErrMessage(socket, 50, err.message);
    }
  },
};

module.exports = cpSocketController;
