
const appSocketEventEmitter = {
  appalarmWasRegistered: async (socket, alarm) => {
    socket.emit('appalarmWasRegistered', { alarm });
  },
};

module.exports = appSocketEventEmitter;
