
const appSocketEventEmitter = {
  alertWasRegistered: async (socket, alarm) => {
    socket.emit('alertWasRegistered', { alarm });
  },
};

module.exports = appSocketEventEmitter;
