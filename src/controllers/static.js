require('dotenv').config();
const Mustache = require('mustache');
const fs = require('fs');
const logger = require('../helpers/logger');
const models = require('../../models');

const { Alarm, User } = models;

const apiUrl = process.env.API_URL;

const controller = {
  getAgreementPage: async (ctx) => {
    logger.info('getAgreementPage');
    try {
      const pt = `${__dirname}/../views/agreement.html`;
      const template = fs.readFileSync(pt).toString('utf8');
      Mustache.parse(template);
      const body = Mustache.render(template, { apiUrl });
      ctx.response.body = body;
    } catch (err) {
      logger.error(err.message);
    }
    return ctx;
  },

  getHistoryPage: async (ctx) => {
    const { params } = ctx;
    const { id } = params;
    logger.info('getHistoryPage', { id });
    const alarmsObjects = await Alarm.findAll({ UserId: id });
    const alarmsArray = alarmsObjects.map(el => el.dataValues);
    const alarms = alarmsArray.map(el => {
      const output = { ...el };
      const zeroPoint = el.track[0];
      [output.lat, output.lng] = zeroPoint;
      return output;
    });
    try {
      const pt = `${__dirname}/../views/history.html`;
      const template = fs.readFileSync(pt).toString('utf8');
      Mustache.parse(template);
      const body = Mustache.render(template, { apiUrl, alarms });
      ctx.response.body = body;
    } catch (err) {
      logger.error(err.message);
    }
    return ctx;
  },
  getAccountPage: async (ctx) => {
    const { params } = ctx;
    const { id } = params;
    logger.info('getAccountPage', { id });

    try {
      const user = await User.findByPk(id);
      const { img, balance } = user;
      const pt = `${__dirname}/../views/account.html`;
      const template = fs.readFileSync(pt).toString('utf8');
      Mustache.parse(template);
      const body = Mustache.render(template, {
        apiUrl, img, id, balance,
      });
      ctx.response.body = body;
    } catch (err) {
      logger.error(err.message);
    }
    return ctx;
  },

};

module.exports = controller;
