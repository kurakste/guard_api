const jwt = require('jsonwebtoken');
const logger = require('../helpers/logger');
const models = require('../../models');

const { User } = models;


async function auth(token) {
  if (!token || token === undefined || token === 'undefined') {
    return {
      res: false,
      user: null,
      code: 3,
      msg: 'Auth token absent.',
    };
  }
  try {
    if (!process.env.JWT_KEY) {
      logger.error('JWT key absent in env.JWT_KEY');
      return {
        res: false,
        user: null,
        code: 500,
        msg: 'server error',
      };
    }
    const res = jwt.verify(token, process.env.JWT_KEY);
    const freshUserFromDb = await User.findByPk(res.id);
    const userForSend = freshUserFromDb.dataValues;
    delete userForSend.password;
    return {
      res: true, user: userForSend, code: null, msg: null,
    };
  } catch (err) {
    return {
      res: false,
      user: null,
      code: 4,
      msg: 'Auth error',
    };
  }
}

module.exports = auth;
