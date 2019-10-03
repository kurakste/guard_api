const appSocketEventEmitter = {

  srvErrMessage: (socket, code, message) => {
    socket.emit('srvErrMessage', { message, code });
  },

  srvAcceptNewTrack: (socket, tid) => {
    socket.emit('srvAcceptNewTrack', { tid });
  },

  srvCancelActiveTrack: (socket, tid) => {
    socket.emit('srvCancelActiveTrack', { tid });
  },

  srvAcceptNewAlarm: (socket) => {
    socket.emit('srvAcceptNewAlarm');
  },

  srvCancelActiveAlarm: (socket) => {
    socket.emit('srvCancelActiveAlarm');
  },

  srvSendAppState: (socket, user) => {
    const getOpenAlarm = () => null;
    const getOpenTrack = () => null;
    const getAlarmHistory = () => null;

    // TODO: Получить незакрытые тревоги т треки если они есть и отправить.
    const openTrack = getOpenTrack();
    const openAlarm = getOpenAlarm();
    const alarmHistory = getAlarmHistory();

    socket.emit('srvSendAppState', {
      user, openTrack, openAlarm, alarmHistory,
    });
  },
};

module.exports = appSocketEventEmitter;
