require('dotenv').config();
const Mustache = require('mustache');
const fs = require('fs');
const logger = require('../helpers/logger');

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
    logger.info('getAgreementPage');
    try {
      const pt = `${__dirname}/../views/history.html`;
      const template = fs.readFileSync(pt).toString('utf8');
      Mustache.parse(template);
      const body = Mustache.render(template, { apiUrl });
      ctx.response.body = body;
    } catch (err) {
      logger.error(err.message);
    }
    return ctx;
  },

};

module.exports = controller;
