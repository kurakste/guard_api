const logger = require('../../../../helpers/logger');
const srvSendAppState = require('./srvSendAppState');
const { connectedUsers } = require('../../../../socketApi');

function sendMessageForUser(userId, title, message) {
  logger.info('sendMessageForUser', { userId, title, message });
  if (!connectedUsers) {
    logger.error('sendMessageForUser: ', userId, title, message);
    return false;
  }
  const user = connectedUsers.find(el => el.userId === userId);
  if (!user) {
    logger.error('sendMessageForUser user not found', { userId, title, message });
    return false;
  }
  const { socket } = user;
  // socket.emit('srvAlertMessage', {
  //   title, message,
  // });
  srvSendAppState(socket, { id: userId, role: 35, isSubscribeActive: true });
  return true;
}

module.exports = sendMessageForUser;
