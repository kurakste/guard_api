const bycrypt = require('bcryptjs');
const apiResponseObject = require('../helpers/getApiResponseObject');
const models = require('../../models');
const checkAndStoreFiles = require('../helpers/checkAndStore');
const logger = require('../helpers/logger');

const { User } = models;

const userController = {
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
    const cryptPassword = await bycrypt.hash(password, 10);
    const user = {
      firstName, lastName, email, tel, password: cryptPassword, role: 31, active: false, notes: '',
    };

    const { files } = ctx.request;
    let newUser;
    try {
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
    const cryptPassword = await bycrypt.hash(password, 10);
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
