const Koa = require('koa');
//  const IO = require('koa-socket-2');
const IO = require('socket.io');
const cors = require('koa-cors');
const cpEventEmitter = require('./cpSocketEventEmitter');
const cpSocketController = require('./socketControllers/сpSocketController');
const appSocketController = require('./socketControllers/appSocketController');
const auth = require('./middelware/auth');
const extractParamsFromUrl = require('./helpers/extractParamsFromUrl');

const appSock = new Koa();
appSock.use(cors());

// const appIo = new IO({
//   namespace: 'app-clients',
// });

// const cpIo = new IO({
//   namespace: 'cp-clients',
// });

const server = require('http').createServer(appSock.callback());
const io = require('socket.io')(server);


// const io = IO(appSock, { origins: '*:*' });
// io.set('origins', '*:*');
// const appIo = io.of('/app-clients');
const cpIo = io.of('/cp-clients');
// const cpIo = io;

// appIo.attach(appSock);
// cpIo.attach(appSock);


// appIo.on('connection', (socket) => {
//   const appNewAlarm = appSocketController.appNewAlarm.bind(appSocketController, cpIo, socket);
//   const appNewPointInTrack = appSocketController.appNewPointInTrack.bind(appSocketController, cpIo);
//   console.log('New user connected.');
//   socket.on('appNewAlarm', appNewAlarm);
//   socket.on('appNewPointInTrack', appNewPointInTrack);
//   socket.on('disconnect', appSocketController.disconnect);
// });


const openCpIoSockets = [];

cpIo.on('connection', (socket) => {
  const params = extractParamsFromUrl(socket.request.url);
  const { token } = params;
  const authResult = auth(token);
  console.log('++++++++++ connection ++++++++++++++++++++++');
  console.log('user connected', params, token, authResult);
  console.log('++++++++++ connection ++++++++++++++++++++++');

  const cpPickedUpAlarm = cpSocketController.cpPickedUpAlarm.bind(cpSocketController, cpIo);
  const cpAlarmGbrSent = cpSocketController.cpAlarmGbrSent.bind(cpSocketController, cpIo);
  const cpAlarmClosed = cpSocketController.cpAlarmClosed.bind(cpSocketController, cpIo);
  const cpAlarmDecline = cpSocketController.cpAlarmDecline.bind(cpSocketController, cpIo);
  const cpRegisterNewCpUser = cpSocketController
    .cpRegisterNewCpUser
    .bind(cpSocketController, socket);
  const cpSignIn = cpSocketController.cpSignIn.bind(cpSocketController, socket);
  socket.on('cpRegisterNewCpUser', cpRegisterNewCpUser);
  socket.on('cpSignIn', cpSignIn);
  socket.on('cpPing', (data) => {
    console.log('++++++++++ ping ++++++++++++++++++++++');
    console.log(authResult);
    console.log('++++++++++ ping ++++++++++++++++++++++');
  });
  if (authResult) {
    const { id } = authResult;
    const conObject = { id, socket };
    try {
      const usersIds = openCpIoSockets.map(el => el.id);
      if (usersIds.indexOf(id) !== -1) throw new Error('user with this ID connected');
      openCpIoSockets.push(conObject);
      console.log(`New ID: ${id} operator connected.`);
      socket.on('cpPickedUpAlarm', cpPickedUpAlarm);
      socket.on('cpAlarmGbrSent', cpAlarmGbrSent);
      socket.on('cpAlarmClosed', cpAlarmClosed);
      socket.on('cpAlarmDecline', cpAlarmDecline);
      socket.on('disconnect', () => {
        openCpIoSockets.splice(openCpIoSockets.indexOf(conObject), 1);
        cpEventEmitter.srvNewUserDisconnected(cpIo, id);
        console.log(`Cp disconnected operator with ID:${conObject.uid}`);
      });
      cpEventEmitter.srvUpdateAlarmListAll(socket);
      cpEventEmitter.srvUpdateUserList(socket, openCpIoSockets.map(el => el.id));
      cpEventEmitter.srvNewUserConnected(cpIo, id);
    } catch (error) {
      console.log('error: ', error);
      cpSocketController.cpErrorMessage(socket, error.message);
    }
  }
});


server.listen(3333, () => {
  console.log('Application is starting on port 3333');
});
