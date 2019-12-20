const models = require('../../../../models');

const { User } = models;

async function isUserMaster(uid) {
  const user = await User.findByPk(uid);
  if (!user) throw new Error(`User with id: ${uid} not fond in isUserMaster() function`);
  return user.master;
}

module.exports = isUserMaster;
