const fs = require('fs');
const Mustache = require('mustache');
const logger = require('../helpers/logger');
const trackService = require('../services/track.service');

const apiUrl = process.env.API_URL;

const controller = {
  sendTrackToUser: async (ctx) => {
    const { params } = ctx;
    const { userId, date } = params;
    logger.info('sendTrackToUser', { userId, date });
    await trackService.getTrackByUserIdAndDate(userId, date);
    try {
      const pt = `${__dirname}/../views/trackSentSuccess.html`;
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
