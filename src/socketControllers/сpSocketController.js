const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cpSocketEmitter = require('../socketEventEmitters/cpEventEmitters');
const sppSocketEmitter = require('../socketEventEmitters/appEventEmitters');
const models = require('../../models');
const logger = require('../helpers/logger');

const { Alarm, Gbr, User } = models;

const cpSocketController = {

  cpRegisterNewCpUser: async (cpIo, socket, data) => {
    logger.info('cpRegisterNewCpUser', data);
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
      const [updated] = await User.update({ role: 35, active: true }, { where: { id } });
      if (updated === 0) throw new Error('Record not found in DB.');
      const updatedUser = await User.findByPk(id);
      const newUser = updatedUser.dataValues;
      cpIo.emit('srvApproveAppUser', newUser);
    } catch (err) {
      logger.error(err.message);
      cpSocketEmitter.srvErrMessage(socket, 11, err.message);
    }
  },

  cpAppUserDecline: async (socket, cpIo, data) => {
    const { payload } = data;
    const user = payload;
    logger.info('srvDeclineAppUser', user);
    const { id } = user;
    try {
      const [updated] = await User.update({ role: 33 }, { where: { id } });
      if (updated === 0) throw new Error('Record not found in DB.');
      const updatedUser = await User.findByPk(id);
      const newUser = updatedUser.dataValues;
      cpIo.emit('srvDeclineCpUser', newUser);
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
      const [updated] = await User.update({ role: 36, active: true }, { where: { id } });
      if (updated === 0) throw new Error('Record not found in DB.');
      const updatedUser = await User.findByPk(id);
      const newUser = updatedUser.dataValues;
      cpIo.emit('srvUpdateCpUser', newUser);
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
      cpIo.emit('srvDeclineCpUser', newUser);
    } catch (err) {
      logger.error(err.message);
      cpSocketEmitter.srvErrMessage(socket, 11, err.message);
    }
  },

  cpSignIn: async (socket, data) => {
    const { payload } = data;
    const user = payload;
    logger.info('cpSignIn: ', { iGetThisUser: user });
    try {
      const userFromDb = await User.findOne({
        where: { email: user.email, role: [32, 34, 36] },
      });
      if (!userFromDb) throw new Error('Login error 1');
      logger.info('User from signIn: ', userFromDb.password);
      const loginResult = await bcrypt
        .compare(user.password, userFromDb.password);
      logger.info('login result: ', loginResult);
      if (!loginResult) throw new Error('Login error 2');
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
    logger.info('cpPickedUpAlarm: ', user);
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
    logger.info('cpAlarmGbrSent: ');
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
  cpAlarmClosed: async (cpIo, socket, appAllUsersArray, data) => {
    logger.info('cpAlarmClosed', data);
    try {
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
      const userSocket = getSocketByUserId(appAllUsersArray, alarmUpdated.UserId);
      if (userSocket) sppSocketEmitter.sendUserMessage(userSocket, 'Тревога была успешно закрыта оператором. Если у вас остались вопросы - свяжитесь с нами: 8-800-201-495-7');
    } catch (err) {
      logger.error(err);
      cpSocketEmitter.srvErrMessage(socket, 40, err.message);
    }
  },

  cpAlarmDecline: async (cpIo, socket, appAllUsersArray, data) => {
    logger.info('cpAlarmDecline', data);
    try {
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
      const userSocket = getSocketByUserId(appAllUsersArray, alarmUpdated.UserId);
      if (userSocket) sppSocketEmitter.sendUserMessage(userSocket, 'Тревога была отклонена оператором. Если у вас остались вопросы - свяжитесь с нами: 8-800-201-495-7');
    } catch (err) {
      logger.error(err);
      cpSocketEmitter.srvErrMessage(socket, 50, err.message);
    }
  },

  cpGiveMeUserList: async (socket) => {
    logger.info('cpGiveMeUserList');
    cpSocketEmitter.srvSendAllCpUserListForOneCpUser(socket);
    cpSocketEmitter.srvSendAllAppUserListForOneCpUser(socket);
  },
};

module.exports = cpSocketController;

function getSocketByUserId(arrayOfUser, userId) {
  const item = (arrayOfUser || []).find(el => el.userId === userId);
  if (item && item.socket) return item.socket;
  return false;
}
