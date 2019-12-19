const Sequelize = require('sequelize');
const models = require('../../../../../models');

const { Op } = Sequelize;

const { Alarm } = models;

async function getOpenAlarm(user) {
  const alarm = await Alarm.findOne({
    where: {
      UserId: user.id,
      status: {
        [Op.lt]: 30,
      },
    },
  });
  const out = alarm ? alarm.dataValues : null;
  return out;
}

module.exports = getOpenAlarm;
