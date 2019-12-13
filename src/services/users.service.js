const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const fs = require('fs');
const { isBase64Image } = require('isbase64image');

// const NotActiveUserError = require('./errors/NotActiveUserError');
const EmailNotFound = require('./errors/EmailNotFound');
const IncorrectUsernameOrPasswordError = require('./errors/IncorrectUsernameOrPasswordError');
const { User } = require('../../models');
const getCode = require('../helpers/getCode');
const { sendCodeToEmail } = require('./email.services');
const logger = require('../helpers/logger');

// const checkAndStoreFiles = require('../helpers/checkAndStore');

const userService = {
  getUser: async (id) => {
    const userFromDb = await User.findByPk(id);
    if (!userFromDb) throw new Error('User not found');
    const user = userFromDb.dataValues;
    return user;
  },

  patchUser: async (id, devId, firstName, lastName, middleName) => {
    const updateObj = {};
    if (firstName) updateObj.firstName = firstName;
    if (lastName) updateObj.lastName = lastName;
    if (middleName) updateObj.middleName = middleName;
    const [res, users] = await User.update(
      updateObj,
      { returning: true, where: { id, devId } },
    );
    // const user = userFromDb.dataValues;
    if (!res) throw new Error('User not found');
    return users[0].dataValues;
  },

  deleteUser: async (id, devId) => {
    const result = await User.destroy({ where: { id, devId } });
    return !!result;
  },

  getRestorePasswordTokenAndSendCodeToUsersEmail: async (email, devId) => {
    const userFromDbObj = await User.findOne({
      where: { email, devId },
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

  restorePasswordStepTwo: async (restoreToken, code, email, password, devId) => {
    if (!process.env.JWT_KEY) throw new Error('JWT key not exist');
    const decoded = jwt.verify(restoreToken, process.env.JWT_KEY);
    const decodedCode = decoded.code;
    if (!(decodedCode === code)) throw new Error('Неверный код восстановления.');
    const userFromDbObj = await User.findOne({
      where: { email, devId },
    });
    if (!userFromDbObj) throw new Error('Либо не верный E-mail либо вы пытаетесь восстановить пароль с нового устройства.');
    if (!password) throw new Error('Password required.');
    const cryptPassword = await bcrypt.hash(password, 10);
    userFromDbObj.password = cryptPassword;
    await userFromDbObj.save();
    return null;
  },

  userSignIn: async (email, password, devId) => {
    const userFromDbObj = await User.findOne({
      where: { email, devId, role: [35, 31, 33] },
    });
    if (!userFromDbObj) throw new IncorrectUsernameOrPasswordError();
    const user = { ...userFromDbObj.dataValues };
    const passwordFromDb = user.password;
    const loginResult = await bcrypt
      .compare(password, passwordFromDb);
    logger.info('login result: ', { loginResult });
    if (!loginResult) throw new IncorrectUsernameOrPasswordError();
    // if (!user.active) throw new NotActiveUserError();
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

  addNewUser: async (
    firstName, lastName, middleName,
    email, devId, tel, password, img, pasImg1, pasImg2,
  ) => {
    if ((!password)) throw new Error('Password can\'t be blank.');
    const cryptPassword = await bcrypt.hash(password, 10);
    const user = {
      firstName, lastName, middleName, email, devId, tel, password: cryptPassword, role: 31, active: false, notes: '',
    };

    const isUserRegistered = await User.findOne({ where: { email, devId } });
    if (isUserRegistered) throw new Error('Данное устройство уже зарегистрировано с таким e-mail. Если забыли пароль - нажмите ссылку восстановить пароль.');
    const usersWithThisEmail = await User.findAll({ where: { email } });
    let master = true;
    let masterUser = null;
    if (usersWithThisEmail.length > 0) {
      masterUser = usersWithThisEmail.find(el => el.master);
      // console.log('--------------', masterUser.subscriptionId);
      if (!masterUser) throw new Error('Не могу зарегистрировать пользователя на этот E-mail. Отсутствует мастер-пользователь. Обратитесь в службу поддержки.');
      master = false;
      const coolSubscription = masterUser.subscriptionId === 3 || masterUser.subscriptionId === 4;
      if (usersWithThisEmail.length <= 2 && !coolSubscription) throw new Error('Не могу зарегистрировать пользователя на этот E-mail. Уже есть зарегистрированные устройства на этого пользователя. Выберите подписку на 6 или 12 месяцев.');
      if (usersWithThisEmail.length > 2) throw new Error('Не могу зарегистрировать пользователя на этот E-mail. Уже зарегистрировано три устройства.');
    }
    const result = await User.create(user);
    const newUser = result.dataValues;
    try {
      // const pathObj = await checkAndStoreFiles(newUser.id, files);
      const imgPath = checkAndStoreBase64toImgFile(newUser.id, img, 'img');
      const pasImg1Path = checkAndStoreBase64toImgFile(newUser.id, pasImg1, 'pasImg1');
      const pasImg2Path = checkAndStoreBase64toImgFile(newUser.id, pasImg2, 'pasImg2');
      await User.update({
        master,
        img: imgPath,
        pasImg1: pasImg1Path,
        pasImg2: pasImg2Path,
        rebillId: (masterUser) ? masterUser.rebillId : null,
        isSubscribeActive: (masterUser) ? masterUser.isSubscribeActive : null,
        subscriptionId: (masterUser) ? masterUser.subscriptionId : null,
        subscriptionStartsAt: (masterUser) ? masterUser.subscriptionStartsAt : null,

      }, { where: { id: newUser.id } });
      const finalUserObj = await User.findByPk(newUser.id);
      const finalUser = finalUserObj.dataValues;
      finalUser.password = null;
      return finalUser;
    } catch (err) {
      logger.error('addNewUser', { error: err.message });
      if (newUser) await User.destroy({ where: { id: newUser.id } });
      throw new Error(err.message);
    }
  },

  getNewAppUsers: async () => {
    const dataObj = await User.findAll({ where: { role: 31 } });
    const data = dataObj.map(el => el.dataValues);
    return data;
  },

  updateSubscriptionStatus: async (userId, subscriptionId) => {
    const user = await User.findByPk(userId);
    if (!user) {
      logger.error('Not found user in updateSubscriptionStatus', { userId });
      return false;
    }
    user.subscriptionId = subscriptionId;
    user.isSubscribeActive = true;
    user.subscriptionStartsAt = Date.now();
    await user.save();
    return true;
  },
};

module.exports = userService;

// ================ helpers ===========================

function checkAndStoreBase64toImgFile(userId, str, imgType) {
  const ext = isBase64Image(str);
  if (!ext) return 'not_valid_image.png';
  const imgPath = `${userId}_${imgType}.${ext}`;
  const buf = Buffer.from(str, 'base64');
  fs.writeFileSync(`public/img/${imgPath}`, buf);
  return imgPath;
}
