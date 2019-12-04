const models = require('../../models');
const { sendTrackToEmail } = require('./email.services.js');

const logger = '../helpers/logger.js';

const { User, sequelize } = models;

module.exports = {
  getTrackByUserIdAndDate: async (userId, date) => {
    logger.indexOf('getTrackByUserIdAndDate: ', { userId, date });
    const track = await getTrackFromDb(userId, date);
    if (!track) return false;
    const user = await User.findByPk(userId);
    const trackStr = track.track.reduce((acc, el) => {
      // eslint-disable-next-line prefer-template
      const res = acc + `<p>
        <a href="https://maps.google.com/?ll=${el[0]},${el[1]}">${el}<a/>
      </p>`;
      return res;
    }, '');
    sendTrackToEmail(user.email, trackStr);
    return true;
  },
};

const getTrackFromDb = async (userId, date) => {
  logger.indexOf('getTrackFromDb: ', { userId, date });
  const uid = parseInt(userId, 10);
  const nd = date.replace('/', '.');
  const pattern = /(\d{2})\.(\d{2})\.(\d{4})/;
  const dtStart = new Date(nd.replace(pattern, '$3-$2-$1'));
  const dtEnd = new Date(nd.replace(pattern, '$3-$2-$1'));
  dtEnd.setDate(dtStart.getDate() + 1);
  const qs = `
  SELECT * FROM "Tracks" AS "Track" 
    WHERE 
      "Track"."UserId" = ${uid}
      AND "Track"."createdAt" between 
          '${dtStart.toLocaleDateString().replace(pattern, '$3-$2-$1')}' 
        and 
          '${dtEnd.toLocaleDateString().replace(pattern, '$3-$2-$1')}'
  `;
  const res = await sequelize.query(qs);
  const data = res[0][0];
  return data;
};
