const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const NotActiveUserError = require('./errors/NotActiveUserError');
const EmailNotFound = require('./errors/EmailNotFound');
const IncorrectUsernameOrPasswordError = require('./errors/IncorrectUsernameOrPasswordError');
const { User } = require('../../models');
const getCode = require('../helpers/getCode');
const sendCodeToEmail = require('../helpers/sendCodeToEmail');
const logger = require('../helpers/logger');
const checkAndStoreFiles = require('../helpers/checkAndStore');

const userService = {
  getUser: async (id) => {
    const userFromDb = await User.findByPk(id);
    if (!userFromDb) throw new Error('User not found');
    const user = userFromDb.dataValues;
    return user;
  },

  getRestorePasswordTokenAndSendCodeToUsersEmail: async (email) => {
    const userFromDbObj = await User.findOne({
      where: { email },
    });
    if (!userFromDbObj) throw new EmailNotFound();
    const code = getCode();
    logger.info('postRestorePasswordStepOne: ', { email, code });
    const secretObject = {
      time: Date().toString(),
      code,
    };

    if (!process.env.JWT_KEY) throw new Error('JWT key not exist');
    const restoreToken = jwt.sign(
      secretObject,
      process.env.JWT_KEY,
      { expiresIn: 60 * 30 },
    );

    sendCodeToEmail(code, email);
    return restoreToken;
  },

  restorePasswordStepTwo: async (restoreToken, code, email, password) => {
    if (!process.env.JWT_KEY) throw new Error('JWT key not exist');
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
    return null;
  },

  userSignIn: async (email, password) => {
    const userFromDbObj = await User.findOne({
      where: { email, role: [35, 31, 33] },
    });
    if (!userFromDbObj) throw new IncorrectUsernameOrPasswordError();
    const user = { ...userFromDbObj.dataValues };
    const passwordFromDb = user.password;
    const loginResult = await bcrypt
      .compare(password, passwordFromDb);
    logger.info('login result: ', { loginResult });
    if (!loginResult) throw new IncorrectUsernameOrPasswordError();
    if (!user.active) throw new NotActiveUserError();
    const userForSend = { ...user };
    if (!process.env.JWT_KEY) throw new Error('JWT key not exist');
    const token = jwt.sign(
      userForSend,
      process.env.JWT_KEY,
      { expiresIn: '96h' },
    );
    delete userForSend.password;
    return [userForSend, token];
  },

  addNewUser: async (firstName, lastName, email, tel, password, files) => {
    if ((!password)) throw new Error('Password can\'t be blank.');
    const cryptPassword = await bcrypt.hash(password, 10);
    const user = {
      firstName, lastName, email, tel, password: cryptPassword, role: 31, active: false, notes: '',
    };

    const checkUserInDb = await User.findOne({ where: { email: user.email } });
    if (checkUserInDb) throw new Error('User with this email already exist.');

    const result = await User.create(user);
    const newUser = result.dataValues;
    try {
      const pathObj = await checkAndStoreFiles(newUser.id, files);
      await User.update({
        img: pathObj.img,
        pasImg1: pathObj.pasImg1,
        pasImg2: pathObj.pasImg2,
      }, { where: { id: newUser.id } });
      const finalUserObj = await User.findByPk(newUser.id);
      const finalUser = finalUserObj.dataValues;
      finalUser.password = null;
      return finalUser;
    } catch (err) {
      if (newUser) await User.destroy({ where: { id: newUser.id } });
      throw new Error(err.message);
    }
  },

  getNewAppUsers: async () => {
    const dataObj = await User.findAll({ where: { role: 31 } });
    const data = dataObj.map(el => el.dataValues);
    return data;
  },
}

module.exports = userService;
