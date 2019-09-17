const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const getUserFromToken = require('../helpers/getUserFromToken');
const cpSocketEmitter = require('../cpSocketEventEmitter');
const models = require('../../models');

const { Alarm, Gbr, User } = models;

const cpSocketController = {

  cpRegisterNewCpUser: async (socket, data) => {
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
      console.log('user: ', result.dataValues);
      delete result.dataValues.password;
      cpSocketEmitter.srvNewUserWasCreated(socket, result.dataValues);
    } catch (err) {
      socket.emit('errMessage', err.message);
      console.log(err);
    }
  },

  cpSignIn: async (socket, data) => {
    const { payload } = data;
    const user = payload;
    console.log('cpSignIn: ', user);
    try {
      const userFromDb = await User.findOne({
        where: { email: user.email },
      });
      console.log('User from signIn: ', userFromDb.password);
      if (!userFromDb.active) throw new Error('User doesn\'t active. Contact the server administrator');
      const loginResult = await bcrypt
        .compare(user.password, userFromDb.password);
      console.log('login result: ', loginResult);
      if (!loginResult) throw new Error('Login error');
      const userForSend = { ...userFromDb.dataValues };
      if (!process.env.JWT_KEY) throw new Error('JWT key not exist');
      const token = jwt.sign(
        userForSend,
        process.env.JWT_KEY,
        { expiresIn: '96h' },
      );
      delete userForSend.password;
      cpSocketEmitter.srvLoginOk(socket, loginResult, userForSend, token);
    } catch (err) {
      console.log('errMessage: ', err);
      socket.emit('errMessage', err.message);
    }
  },

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
      console.log('cpAlarmClosed', data);
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
      console.log('cpAlarmDecline', data);
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
