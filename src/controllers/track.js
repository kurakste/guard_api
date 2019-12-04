const logger = require('../helpers/logger');
const trackService = require('../services/track.service');

const apiUrl = process.env.API_URL;
const redirectionUrl = `${apiUrl}/track-sent-success`;

const controller = {
  sendTrackToUser: async (ctx) => {
    const { params } = ctx;
    const { userId, date } = params;
    logger.info('sendTrackToUser', { userId, date });
    await trackService.getTrackByUserIdAndDate(userId, date);
    ctx.response.redirect(redirectionUrl);
    return ctx;
  },
};

module.exports = controller;
