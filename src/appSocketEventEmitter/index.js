
const appSocketEventEmitter = {
  appAlertWasRegistered: async (socket, alert) => {
    socket.emit('appAlertWasRegistered', { alert });
  },
};

module.exports = appSocketEventEmitter;
