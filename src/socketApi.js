const Koa = require('koa');
const IO = require('koa-socket-2');
const cors = require('koa-cors');
const controller = require('./socketControllers');
const cpEventEmitter = require('./cpSocketEventEmitter');
const cpSocketController = require('./socketControllers/spSocketController');

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
  console.log('New user connected.');
  socket.on('appNewAlarm', appNewAlarm);
  socket.on('disconnect', controller.disconnect);
});

cpIo.on('connection', (socket) => {
  const cpPickedUpAlarm = cpSocketController.cpPickedUpAlarm.bind(cpSocketController, cpIo);
  const { uid } = socket.handshake.query;
  const conObject = { uid, socket };
  
  cpEventEmitter.srvUpdateAlarmListAll(socket);

  openCpIoSockets.push(conObject);
  console.log(`New ID: ${uid} operator connected.`);

  socket.on('cpPickedUpAlarm', cpPickedUpAlarm);

  socket.on('disconnect', () => {
    openCpIoSockets.splice(openCpIoSockets.indexOf(conObject), 1);
    console.log(`Cp disconnected operator with ID:${conObject.uid}`);
  });
});

appSock.listen(3333, () => {
  console.log('Sockets starts at localhost:3333');
});
