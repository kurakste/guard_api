
const Koa = require('koa');
const IO = require('koa-socket-2');
const cors = require('koa-cors');
const controller = require('./socketControllers');
const cpEventEmitter = require('./cpSocketEventEmitter');

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
  const appNewAlarm = controller.appNewAlarm.bind(controller, cpIo, socket);
  const appNewPointInTrack = controller.appNewPointInTrack.bind(controller, cpIo);
  console.log('New user connected.');
  socket.on('appNewAlarm', appNewAlarm);
  socket.on('appNewPointInTrack', appNewPointInTrack);
  socket.on('disconnect', controller.disconnect);
});

cpIo.on('connection', (socket) => {
  const { uid } = socket.handshake.query;
  const conObject = { uid, socket };
  openCpIoSockets.push(conObject);
  cpEventEmitter.getFreeAlarmList(socket);
  console.log(`New ID: ${uid} operator connected.`);

  socket.on('disconnect', () => {
    openCpIoSockets.splice(openCpIoSockets.indexOf(conObject), 1);
    console.log(`Cp disconnected operator with ID:${conObject.uid}`);
  });
});

appSock.listen(3333, () => {
  console.log('Sockets starts at localhost:3333');
});
