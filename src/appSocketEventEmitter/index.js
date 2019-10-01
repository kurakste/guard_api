const appSocketEventEmitter = {

  srvErrMessage: (socket, code, message) => {
    socket.emit('srvErrMessage', { message, code });
  },

  srvSendAppState: (socket, user) => {
    socket.emit('srvSendAppState', { user });
  },
};

module.exports = appSocketEventEmitter;
