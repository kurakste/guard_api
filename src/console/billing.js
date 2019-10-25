const models = require('../../models');

const { User } = models;

async function doBilling() {
  const users = await User.findAll({
    where: { role: 35, lowBallance: false },
  });
  console.log(users.length);
}

module.exports = doBilling;
