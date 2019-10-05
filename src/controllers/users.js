const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const apiResponseObject = require('../helpers/getApiResponseObject');
const models = require('../../models');
const checkAndStoreFiles = require('../helpers/checkAndStore');
const logger = require('../helpers/logger');
const getCode = require('../helpers/getCode');
const { cpIOBus } = require('../socketApi');

const { User } = models;


const userController = {
  postRestorePasswordStepOne: async (ctx) => {
    const { body } = ctx.request;
    const { email } = body;
    const code = getCode();
    logger.info('postRestorePasswordStepOne: ', { email, code });
    const secretObject = {
      time: Date().toString(),
      code,
    };
    try {
      if (!process.env.JWT_KEY) throw new Error('JWT key not exist');
      const restoreToken = jwt.sign(
        secretObject,
        process.env.JWT_KEY,
        { expiresIn: 60 * 30 },
      );
      const output = apiResponseObject(true, null, { restoreToken });
      ctx.body = output;
    } catch (err) {
      const output = apiResponseObject(false, err.message, null, 500);
      ctx.body = output;
      logger.error('errMessage: ', err);
    }
  },

  postRestorePasswordStepTwo: async (ctx) => {
    const { body } = ctx.request;
    logger.info('postRestorePasswordStepTwo: ', body);
    const {
      restoreToken, code, email, password,
    } = body;
    try {
      if (!process.env.JWT_KEY) throw new Error('JWT key not exist');
      try {
        const decoded = jwt.verify(restoreToken, process.env.JWT_KEY);
        const decodedCode = decoded.code;
        if (!(decodedCode === code)) throw new Error('Wrong code');
        const userFromDbObj = await User.findOne({
          where: { email },
        });
        if (!userFromDbObj) throw new Error('wrong email');
        if (!password) throw new Error('Password required.');
        const cryptPassword = await bcrypt.hash(password, 10);
        userFromDbObj.password = cryptPassword;
        await userFromDbObj.save();
        const output = apiResponseObject(true, null, { mgs: 'work done' }, 0);
        ctx.body = output;
      } catch (err) {
        const output = apiResponseObject(false, err.message, null, 301);
        ctx.body = output;
        logger.error('postRestorePasswordStepTwo: ', err);
      }
    } catch (err) {
      const output = apiResponseObject(false, err.message, null, 500);
      ctx.body = output;
      logger.error('postRestorePasswordStepTwo: ', err);
    }
  },

  postSignIn: async (ctx) => {
    const { body } = ctx.request;
    const { email, password } = body;
    logger.info('postSignIn: ', body);

    try {
      const userFromDbObj = await User.findOne({
        where: { email },
      });
      if (!userFromDbObj) {
        const msg = 'Incorrect username or password';
        logger.error(msg);
        const output = apiResponseObject(false, msg, null, 307);
        ctx.body = output;
        return;
      }
      const user = { ...userFromDbObj.dataValues };
      const passwordFromDb = user.password;
      const loginResult = await bcrypt
        .compare(password, passwordFromDb);
      logger.info('login result: ', { loginResult });

      if (!loginResult) {
        const msg = 'Incorrect username or password';
        logger.error(msg);
        const output = apiResponseObject(false, msg, null, 307);
        ctx.body = output;
        return;
      }

      if (!user.active) {
        const msg = 'User doesn\'t active. Contact the server administrator';
        const output = apiResponseObject(false, msg, null, 308);
        ctx.body = output;
        return;
      }
      const userForSend = { ...user };
      if (!process.env.JWT_KEY) throw new Error('JWT key not exist');
      const token = jwt.sign(
        userForSend,
        process.env.JWT_KEY,
        { expiresIn: '96h' },
      );
      delete userForSend.password;
      const output = apiResponseObject(true, null, {
        user: userForSend,
        token,
      });
      ctx.body = output;
    } catch (err) {
      const output = apiResponseObject(false, err.message, null, 500);
      ctx.body = output;
      logger.error('postSignIn: ', err);
    }
  },

  getUser: async (ctx) => {
    const { params } = ctx;
    const { id } = params;
    try {
      const userFromDb = await User.findByPk(id);
      if (!userFromDb) throw new Error('User not found');
      const user = userFromDb.dataValues;
      const output = apiResponseObject(true, '', user);
      ctx.body = JSON.stringify(output, null, '\t');
    } catch (err) {
      const output = apiResponseObject(false, err.message, null);
      ctx.body = output;
      logger.error(err.message);
    }
  },

  // TODO: There is two type of new user - appuser & control panel user.
  postNewAppUser: async (ctx) => {
    const { body } = ctx.request;
    // TODO: What about validation? Use sequelize? Write new function for it?
    // TODO: Add email validation is user with that email exist or no.
    const {
      firstName, lastName, email, tel, password,
    } = body;
    const cryptPassword = await bcrypt.hash(password, 10);
    const user = {
      firstName, lastName, email, tel, password: cryptPassword, role: 31, active: false, notes: '',
    };

    const { files } = ctx.request;
    let newUser;
    try {
      const checkUserInDb = await User.findOne({ where: { email: user.email } });
      if (checkUserInDb) throw new Error('User with this email already exist.');

      const result = await User.create(user);
      newUser = result.dataValues;
      const pathObj = await checkAndStoreFiles(newUser.id, files);
      await User.update({
        img: pathObj.img,
        pasImg1: pathObj.pasImg1,
        pasImg2: pathObj.pasImg2,
      }, { where: { id: newUser.id } });
      const finalUserObj = await User.findByPk(newUser.id);
      const finalUser = finalUserObj.dataValues;
      finalUser.password = null;

      ctx.body = apiResponseObject(true, '', JSON.stringify(finalUser, null, '\t'));
      cpIOBus.emit('srvNewUserWasCreated', finalUser);
    } catch (err) {
      if (newUser) await User.destroy({ where: { id: newUser.id } });
      const output = apiResponseObject(false, err.message, null);
      ctx.body = output;
      logger.error(err);
    }
  },

  getNewAppUsers: async (ctx) => {
    try {
      const dataObj = await User.findAll({ where: { role: 31 } });
      const data = dataObj.map(el => el.dataValues);
      const output = apiResponseObject(true, '', data);
      ctx.body = JSON.stringify(output, null, '\t');
    } catch (err) {
      const output = apiResponseObject(false, err.message, null);
      ctx.body = output;
      logger.error(err.message);
    }
  },

  postDeclineAppUser: async (ctx) => {
    const { body } = ctx.request;
    const { id } = body;
    logger.info('id: ', id);
    try {
      const [updated] = await User.update({ role: 33 }, { where: { id } });
      if (updated === 0) throw new Error('Record not found in DB.');
      const updatedUser = await User.findByPk(id);
      const newUser = updatedUser.dataValues;
      const output = apiResponseObject(true, '', newUser);
      ctx.body = JSON.stringify(output, null, '\t');
    } catch (err) {
      const output = apiResponseObject(false, err.message, null);
      ctx.body = output;
      logger.error(err.message);
    }
  },

  postVerifyAppUser: async (ctx) => {
    const { body } = ctx.request;
    const { id } = body;
    try {
      const [updated] = await User.update({ role: 35 }, { where: { id } });
      if (updated === 0) throw new Error('Record not found in DB.');
      const updatedUser = await User.findByPk(id);
      const newUser = updatedUser.dataValues;
      const output = apiResponseObject(true, '', newUser);
      ctx.body = JSON.stringify(output, null, '\t');
    } catch (err) {
      const output = apiResponseObject(false, err.message, null);
      ctx.body = output;
      logger.error(err.message);
    }
  },

  // TODO: There is two type of new user - appuser & control panel user.
  postNewCPUser: async (ctx) => {
    const { body } = ctx.request;
    // TODO: What about validation? Use sequelize? Write new function for it?
    // TODO: Add email validation is user with that email exist or no.
    const {
      firstName, lastName, email, tel, password,
    } = body;
    const cryptPassword = await bcrypt.hash(password, 10);
    const user = {
      firstName, lastName, email, tel, password: cryptPassword, role: 32, active: false, notes: '',
    };

    try {
      const result = await User.create(user);
      const newUser = result.dataValues;
      const output = apiResponseObject(true, '', newUser);
      ctx.body = JSON.stringify(output, null, '\t');
    } catch (err) {
      const output = apiResponseObject(false, err.message, null);
      ctx.body = output;
      logger.error(err.message);
    }
  },

  postDeclineCpUser: async (ctx) => {
    const { body } = ctx.request;
    const { id } = body;
    logger.info('id: ', id);
    try {
      const [updated] = await User.update({ role: 34 }, { where: { id } });
      if (updated === 0) throw new Error('Record not found in DB.');
      const updatedUser = await User.findByPk(id);
      const newUser = updatedUser.dataValues;
      const output = apiResponseObject(true, '', newUser);
      ctx.body = JSON.stringify(output, null, '\t');
    } catch (err) {
      const output = apiResponseObject(false, err.message, null);
      ctx.body = output;
      logger.error(err.message);
    }
  },

  postVerifyCpUser: async (ctx) => {
    const { body } = ctx.request;
    const { id } = body;
    try {
      const [updated] = await User.update({ role: 36 }, { where: { id } });
      if (updated === 0) throw new Error('Record not found in DB.');
      const updatedUser = await User.findByPk(id);
      const newUser = updatedUser.dataValues;
      const output = apiResponseObject(true, '', newUser);
      ctx.body = JSON.stringify(output, null, '\t');
    } catch (err) {
      const output = apiResponseObject(false, err.message, null);
      ctx.body = output;
      logger.error(err.message);
    }
  },

  getNewCpUsers: async (ctx) => {
    try {
      const dataObj = await User.findAll({ where: { role: 32 } });
      const data = dataObj.map(el => el.dataValues);
      const output = apiResponseObject(true, '', data);
      ctx.body = JSON.stringify(output, null, '\t');
    } catch (err) {
      const output = apiResponseObject(false, err.message, null);
      ctx.body = output;
      logger.error(err.message);
    }
  },

  patchUser: async (ctx) => {
    const { body } = ctx.request;
    const { user } = body;
    // TODO: What about validation? Use sequelize? Write new function for it?
    try {
      const updatable = getUserUpdatebleObject(user);
      const [updated] = await User.update(updatable, { where: { id: user.id } });
      if (updated === 0) throw new Error('Record not found in DB.');
      const updatedUser = await User.findByPk(user.id);
      const newUser = updatedUser.dataValues;
      const output = apiResponseObject(true, '', newUser);
      ctx.body = JSON.stringify(output, null, '\t');
    } catch (err) {
      const output = apiResponseObject(false, err.message, null);
      ctx.body = output;
      logger.error(err.message);
    }
  },
  deleteUser: async (ctx) => {
    const { params } = ctx;
    const { id } = params;

    try {
      // TODO: Add helper for delete users file.
      if (!id) throw new Error('User id required.');
      const userFromDb = await User.findByPk(id);
      if (!userFromDb) throw new Error('User not found');
      await userFromDb.destroy();
      const output = apiResponseObject(true, '', { message: 'User was deleted.' });
      ctx.body = output;
    } catch (err) {
      const output = apiResponseObject(false, err.message, null);
      ctx.body = output;
      logger.error(err.message);
    }
  },
  getAll: async (ctx) => {
    ctx.body = 'Get all users';
    try {
      const dataObj = await User.findAll();
      const data = dataObj.map(el => el.dataValues);
      const output = apiResponseObject(true, '', data);
      ctx.body = JSON.stringify(output, null, '\t');
    } catch (err) {
      const output = apiResponseObject(false, err.message, null);
      ctx.body = output;
      logger.error(err.message);
    }
  },
};

// TODO: What if we will receive user object w/o some fields? Will it erase current value in DB?
function getUserUpdatebleObject(usr) {
  const {
    firstName, lastName, email, notes, tel, active, role, img, pasImg1, pasImg2, password,
  } = usr;
  return {
    firstName, lastName, email, notes, tel, active, role, img, pasImg1, pasImg2, password,
  };
}
module.exports = userController;
