require('dotenv').config();
const Mustache = require('mustache');
const fs = require('fs');
const logger = require('../helpers/logger');
const models = require('../../models');

const { Alarm, User, Track } = models;

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
    const alarmsObjects = await Alarm.findAll({ where: { UserId: id } });
    const alarmsArray = alarmsObjects.map(el => el.dataValues);
    const alarms = alarmsArray.map(el => {
      const output = { ...el };
      const zeroPoint = el.track[0];
      [output.lat, output.lng] = zeroPoint;
      return output;
    });
    const formatedAlarms = alarms.map(el => {
      const out = { ...el };
      out.createdAt = el.createdAt.toLocaleDateString();
      return out;
    });
    try {
      const pt = `${__dirname}/../views/history.html`;
      const template = fs.readFileSync(pt).toString('utf8');
      Mustache.parse(template);
      const body = Mustache.render(template,
        {
          apiUrl,
          alarms: formatedAlarms,
        });
      ctx.response.body = body;
    } catch (err) {
      logger.error(err.message);
    }
    return ctx;
  },

  getMyTrackPage: async (ctx) => {
    const { params } = ctx;
    const { id } = params;
    logger.info('getMyTrackPage', { id });
    const trackObjects = await Track.findAll({ where: { UserId: id } });
    const trackArray = trackObjects.map(el => el.dataValues);
    const formatedTracks = trackArray.map(el => {
      const out = { ...el };
      out.createdAt = el.createdAt.toLocaleDateString();
      return out;
    });
    try {
      const pt = `${__dirname}/../views/tracks.html`;
      const template = fs.readFileSync(pt).toString('utf8');
      Mustache.parse(template);
      const body = Mustache.render(template,
        {
          apiUrl,
          tracks: formatedTracks,
          userId: id,
        });
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
        apiUrl, img, id, balance, user,
      });
      ctx.response.body = body;
    } catch (err) {
      logger.error(err.message);
    }
    return ctx;
  },

  getHelpPage: async (ctx) => {
    const { params } = ctx;
    const { id } = params;
    logger.info('getHelpPage', { id });

    try {
      const pt = `${__dirname}/../views/help.html`;
      const template = fs.readFileSync(pt).toString('utf8');
      Mustache.parse(template);
      const body = Mustache.render(template, { apiUrl });
      ctx.response.body = body;
    } catch (err) {
      logger.error(err.message);
    }
    return ctx;
  },
  getPaymentSuccessPage: async (ctx) => {
    const { params } = ctx;
    const { id } = params;
    logger.info('getHelpPage', { id });

    try {
      const pt = `${__dirname}/../views/paymentSuccess.html`;
      const template = fs.readFileSync(pt).toString('utf8');
      Mustache.parse(template);
      const body = Mustache.render(template, { apiUrl });
      ctx.response.body = body;
    } catch (err) {
      logger.error(err.message);
    }
    return ctx;
  },

  getPaymentErrorPage: async (ctx) => {
    const { params } = ctx;
    const { id } = params;
    logger.info('getHelpPage', { id });

    try {
      const pt = `${__dirname}/../views/paymentError.html`;
      const template = fs.readFileSync(pt).toString('utf8');
      Mustache.parse(template);
      const body = Mustache.render(template, { apiUrl });
      ctx.response.body = body;
    } catch (err) {
      logger.error(err.message);
    }
    return ctx;
  },

  getUnsubscribeSuccessPage: async (ctx) => {
    logger.info('getUnsubscribeSuccessPage');

    try {
      const pt = `${__dirname}/../views/subscriptionSuccess.html`;
      const template = fs.readFileSync(pt).toString('utf8');
      Mustache.parse(template);
      const body = Mustache.render(template, { apiUrl });
      ctx.response.body = body;
    } catch (err) {
      logger.error(err.message);
    }
    return ctx;
  },

  getUnsubscribeErrorPage: async (ctx) => {
    logger.info('getUnsubscribeErrorPage');

    try {
      const pt = `${__dirname}/../views/subscriptionError.html`;
      const template = fs.readFileSync(pt).toString('utf8');
      Mustache.parse(template);
      const body = Mustache.render(template, { apiUrl });
      ctx.response.body = body;
    } catch (err) {
      logger.error(err.message);
    }
    return ctx;
  },

  getProfileEditPage: async (ctx) => {
    const { params } = ctx;
    const { id } = params;
    logger.info('getProfileEditPage', { id });
    const user = await User.findByPk(id);
    try {
      if (!user) throw new Error('User not found.');
      const pt = `${__dirname}/../views/profileEditPage.html`;
      const template = fs.readFileSync(pt).toString('utf8');
      Mustache.parse(template);
      const body = Mustache.render(template, { apiUrl, user });
      ctx.response.body = body;
    } catch (err) {
      logger.error(err.message);
    }
    return ctx;
  },

};

module.exports = controller;
