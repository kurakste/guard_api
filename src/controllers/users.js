const apiResponseObject = require('../helpers/getApiResponseObject');
const { cpIOBus } = require('../socketApi');
const userService = require('../services/users.service');
const logger = require('../helpers/logger');

const userController = {
  postRestorePasswordStepOne: async (ctx) => {
    const { body } = ctx.request;
    const { email, devId } = body;
    logger.info('postRestorePasswordStepOne: ', { body });
    try {
      const restoreToken = await userService
        .getRestorePasswordTokenAndSendCodeToUsersEmail(email, devId);
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
      restoreToken, code, email, password, devId,
    } = body;
    try {
      await userService
        .restorePasswordStepTwo(restoreToken, parseInt(code, 10), email, password, devId);
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
    const { email, password, devId } = body;
    logger.info('postSignIn: ', body);
    const verifiedDevId = (devId === undefined || devId === '') ? null : devId;
    try {
      const [userForSend, token] = await userService.userSignIn(email, password, verifiedDevId);
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
    logger.info('getUser: ', { params });
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
    const bodyForLog = { ...body };
    bodyForLog.img = null;
    bodyForLog.pasImg1 = null;
    bodyForLog.pasImg2 = null;

    logger.info('postNewAppUser: ', { bodyForLog });
    const {
      firstName, lastName, middleName, email, devId, tel, password, img, pasImg1, pasImg2,
    } = body;
    // img will be sent in this string format: 'image/jpeg;base64,/9j/4AQS...'

    try {
      const finalUser = await userService
        .addNewUser(
          firstName,
          lastName,
          middleName,
          email,
          devId,
          tel,
          password,
          img.split(',')[1],
          pasImg1.split(',')[1],
          pasImg2.split(',')[1],
        );
      ctx.body = apiResponseObject(
        true,
        '',
        JSON.stringify(finalUser, null, '\t'),
      );
      cpIOBus.emit('srvNewUserWasCreated', finalUser);
    } catch (err) {
      const output = apiResponseObject(false, err.message, null);
      ctx.body = output;
      logger.error(err.message);
    }
  },

  getNewAppUsers: async (ctx) => {
    logger.info('getNewAppUsers: ');
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

  deleteUser: async (ctx) => {
    const { params } = ctx;
    const { id, devId } = params;
    const verifiedDevId = (devId === undefined) ? null : devId;
    logger.info('deleteUser: ', { params });
    try {
      const result = await userService.deleteUser(id, verifiedDevId);
      const output = apiResponseObject(result, '', '');
      ctx.body = JSON.stringify(output, null, '\t');
    } catch (err) {
      const output = apiResponseObject(false, err.message, null);
      ctx.body = output;
      logger.error(err.message);
    }
  },

  patchUser: async (ctx) => {
    const { body } = ctx.request;
    const { params } = ctx;
    const { id } = params;
    logger.info('patchUser: ', { id, body });
    const {
      devId, firstName, lastName, middleName,
    } = body;
    const verifiedDevId = (devId === undefined) ? null : devId;

    try {
      const user = await userService.patchUser(id, verifiedDevId, firstName, lastName, middleName);
      user.password = null;
      const output = apiResponseObject(true, null, user);
      ctx.body = JSON.stringify(output);
    } catch (err) {
      const output = apiResponseObject(false, err.message, null);
      ctx.body = output;
      logger.error(err.message);
    }
    return ctx;
  },

};

module.exports = userController;
