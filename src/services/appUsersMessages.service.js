const { connectedUsers } = require('../socketApi');
const logger = require('../helpers/logger');

async function sendInfoMessageForAppById(userId, title, message) {
  logger.info(sendInfoMessageForAppById, { title, message });
  const user = (connectedUsers || []).find(el => el.userId === userId);
  if (user && user.socket) {
    user.socket.emit('srvAlertMessage', { title, message });
    return true;
  }
  logger.error('sendInfoMessageForAppById', { user, title, message });
  return false;
}

module.exports = sendInfoMessageForAppById;
