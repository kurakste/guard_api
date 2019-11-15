const apiResponseObject = require('../helpers/getApiResponseObject');
const { cpIOBus } = require('../socketApi');
const userService = require('../services/users.service');
const logger = require('../helpers/logger');

const userController = {
  postRestorePasswordStepOne: async (ctx) => {
    const { body } = ctx.request;
    const { email } = body;
    try {
      const restoreToken = await userService.getRestorePasswordTokenAndSendCodeToUsersEmail(email);
      ctx.body = apiResponseObject(true, null, { restoreToken });
    } catch (err) {
      const output = apiResponseObject(false, err.message, null, err.code);
      ctx.body = output;
      logger.error('postRestorePasswordStepOne: ', err);
    }
  },

  postRestorePasswordStepTwo: async (ctx) => {
    const { body } = ctx.request;
    logger.info('postRestorePasswordStepTwo: ', body);
    const {
      restoreToken, code, email, password,
    } = body;
    try {
      await userService.restorePasswordStepTwo(restoreToken, code, email, password);
      const output = apiResponseObject(true, null, { mgs: 'work done' }, 0);
      ctx.body = output;
      return ctx;
    } catch (err) {
      const output = apiResponseObject(false, err.message, null, 301);
      ctx.body = output;
      logger.error('postRestorePasswordStepTwo: ', err);
      return ctx;
    }
  },

  postSignIn: async (ctx) => {
    const { body } = ctx.request;
    const { email, password } = body;
    logger.info('postSignIn: ', body);
    try {
      const [userForSend, token] = await userService.userSignIn(email, password);
      const output = apiResponseObject(true, null, {
        user: userForSend,
        token,
      });
      ctx.body = output;
      return ctx;
    } catch (err) {
      const output = apiResponseObject(false, err.message, null, err.code);
      ctx.body = output;
      logger.error('postSignIn: ', err);
      return ctx;
    }
  },

  getUser: async (ctx) => {
    const { params } = ctx;
    const { id } = params;
    try {
      const user = await userService.getUser(id);
      const output = apiResponseObject(true, '', user);
      ctx.body = JSON.stringify(output, null, '\t');
    } catch (err) {
      const output = apiResponseObject(false, err.message, null);
      ctx.body = output;
      logger.error(err.message);
    }
  },

  postNewAppUser: async (ctx) => {
    const { body } = ctx.request;
    // TODO: What about validation? Use sequelize? Write new function for it?
    const {
      firstName, lastName, email, tel, password,
    } = body;
    const { files } = ctx.request;
    try {
      const finalUser = await userService
        .addNewUser(firstName, lastName, email, tel, password, files);
      ctx.body = apiResponseObject(
        true,
        '',
        JSON.stringify(finalUser, null, '\t'),
      );
      cpIOBus.emit('srvNewUserWasCreated', finalUser);
    } catch (err) {
      const output = apiResponseObject(false, err.message, null);
      ctx.body = output;
      logger.error(err);
    }
  },

  getNewAppUsers: async (ctx) => {
    try {
      const data = await userService.getNewAppUsers();
      const output = apiResponseObject(true, '', data);
      ctx.body = JSON.stringify(output, null, '\t');
    } catch (err) {
      const output = apiResponseObject(false, err.message, null);
      ctx.body = output;
      logger.error(err.message);
    }
  },

};

module.exports = userController;
