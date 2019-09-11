const Koa = require('koa');
const IO = require('koa-socket-2');
const cors = require('koa-cors');
const cpEventEmitter = require('./cpSocketEventEmitter');
const cpSocketController = require('./socketControllers/spSocketController');
const appSocketController = require('./socketControllers/appSocketController');

const appSock = new Koa();

const appIo = new IO({
  namespace: 'app-clients',
});

const cpIo = new IO({
  namespace: 'cp-clients',
});


appSock.use(cors());

appIo.attach(appSock);
cpIo.attach(appSock);
const openCpIoSockets = [];

appIo.on('connection', (socket) => {
  const appNewAlarm = appSocketController.appNewAlarm.bind(appSocketController, cpIo, socket);
  const appNewPointInTrack = appSocketController.appNewPointInTrack.bind(appSocketController, cpIo);
  console.log('New user connected.');
  socket.on('appNewAlarm', appNewAlarm);
  socket.on('appNewPointInTrack', appNewPointInTrack);
  socket.on('disconnect', appSocketController.disconnect);
});

cpIo.on('connection', (socket) => {
  const cpPickedUpAlarm = cpSocketController.cpPickedUpAlarm.bind(cpSocketController, cpIo);
  const cpAlarmGbrSent = cpSocketController.cpAlarmGbrSent.bind(cpSocketController, cpIo);
  const cpAlarmClosed = cpSocketController.cpAlarmClosed.bind(cpSocketController, cpIo);
  const cpAlarmDecline = cpSocketController.cpAlarmDecline.bind(cpSocketController, cpIo);
  const { uid } = socket.handshake.query;
  const conObject = { uid, socket };

  cpEventEmitter.srvUpdateAlarmListAll(socket);

  openCpIoSockets.push(conObject);
  console.log(`New ID: ${uid} operator connected.`);

  socket.on('cpPickedUpAlarm', cpPickedUpAlarm);
  socket.on('cpAlarmGbrSent', cpAlarmGbrSent);
  socket.on('cpAlarmClosed', cpAlarmClosed);
  socket.on('cpAlarmDecline', cpAlarmDecline);


  socket.on('disconnect', () => {
    openCpIoSockets.splice(openCpIoSockets.indexOf(conObject), 1);
    console.log(`Cp disconnected operator with ID:${conObject.uid}`);
  });
});

appSock.listen(3333, () => {
  console.log('Sockets starts at localhost:3333');
});
