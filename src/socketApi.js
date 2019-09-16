const Koa = require('koa');
const IO = require('koa-socket-2');
const cors = require('koa-cors');
const cpEventEmitter = require('./cpSocketEventEmitter');
const cpSocketController = require('./socketControllers/сpSocketController');
const appSocketController = require('./socketControllers/appSocketController');
const authMiddleware = require('./helpers/authMiddleware');

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


appIo.on('connection', (socket) => {
  const appNewAlarm = appSocketController.appNewAlarm.bind(appSocketController, cpIo, socket);
  const appNewPointInTrack = appSocketController.appNewPointInTrack.bind(appSocketController, cpIo);
  console.log('New user connected.');
  socket.on('appNewAlarm', appNewAlarm);
  socket.on('appNewPointInTrack', appNewPointInTrack);
  socket.on('disconnect', appSocketController.disconnect);
});


const openCpIoSockets = [];
// cpIo.use(async (ctx, next) => {
//   console.log('+++++++++++++++++++++++++');
// });
cpIo.on('connection', (socket) => {
  socket.use(authMiddleware);
  const cpPickedUpAlarm = cpSocketController.cpPickedUpAlarm.bind(cpSocketController, cpIo);
  const cpAlarmGbrSent = cpSocketController.cpAlarmGbrSent.bind(cpSocketController, cpIo);
  const cpAlarmClosed = cpSocketController.cpAlarmClosed.bind(cpSocketController, cpIo);
  const cpAlarmDecline = cpSocketController.cpAlarmDecline.bind(cpSocketController, cpIo);
  const cpRegisterNewCpUser = cpSocketController
    .cpRegisterNewCpUser
    .bind(cpSocketController, socket);
  const cpSignIn = cpSocketController.cpSignIn.bind(cpSocketController, socket);
  const { uid } = socket.handshake.query;
  const conObject = { uid, socket };
  socket.on('cpRegisterNewCpUser', cpRegisterNewCpUser);
  socket.on('cpSignIn', cpSignIn);
  socket.on('cpPing', (data) => {
    //  console.log('ping: ', data);
    const { token, user, payload } = data;
    const userParsed = JSON.parse(user);
    console.log('ping: ', data);
  });
  try {
    if (!uid) throw new Error('uid is required!');
    const usersIds = openCpIoSockets.map(el => el.uid);
    if (usersIds.indexOf(uid) !== -1) throw new Error('user with this ID connected');
    openCpIoSockets.push(conObject);
    console.log(`New ID: ${uid} operator connected.`);
    socket.on('cpPickedUpAlarm', cpPickedUpAlarm);
    socket.on('cpAlarmGbrSent', cpAlarmGbrSent);
    socket.on('cpAlarmClosed', cpAlarmClosed);
    socket.on('cpAlarmDecline', cpAlarmDecline);
    socket.on('disconnect', () => {
      openCpIoSockets.splice(openCpIoSockets.indexOf(conObject), 1);
      cpEventEmitter.srvNewUserDisconnected(cpIo, uid);
      console.log(`Cp disconnected operator with ID:${conObject.uid}`);
    });
    cpEventEmitter.srvUpdateAlarmListAll(socket);
    cpEventEmitter.srvUpdateUserList(socket, openCpIoSockets.map(el => el.uid));
    cpEventEmitter.srvNewUserConnected(cpIo, uid);
  } catch (error) {
    console.log('error: ', error);
    cpSocketController.cpErrorMessage(socket, error.message);
  }
});

appSock.listen(3333, () => {
  console.log('Sockets starts at localhost:3333');
});
