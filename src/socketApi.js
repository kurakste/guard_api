const Koa = require('koa');
const cors = require('koa-cors');
const http = require('http');
const IO = require('socket.io');
const urlParser = require('url-parameter-parser');
const cpEventEmitter = require('./cpSocketEventEmitter');
const cpSocketController = require('./socketControllers/сpSocketController');
const appSocketController = require('./socketControllers/appSocketController');
const auth = require('./middleware/auth');
const logger = require('./helpers/logger');

const appSock = new Koa();
appSock.use(cors());

const server = http.createServer(appSock.callback());
const io = IO(server);
const cpIo = io.of('/cp-clients');
const appIo = io.of('/app-clients');

appIo.on('connection', (socket) => {
  const appNewAlarm = appSocketController
    .appNewAlarm.bind(appSocketController, cpIo, socket);
  const appNewPointInTrack = appSocketController.appNewPointInTrack
    .bind(appSocketController, cpIo);
  logger.info('New user connected.');
  socket.on('appNewAlarm', appNewAlarm);
  socket.on('appNewPointInTrack', appNewPointInTrack);
  socket.on('disconnect', appSocketController.disconnect);
});


const openCpIoSockets = [];

cpIo.on('connection', (socket) => {
  const params = urlParser(socket.request.url);
  const { token } = params;
  const authResult = auth(token);
  logger.info('user connected', params, token, authResult);
  const cpPickedUpAlarm = cpSocketController.cpPickedUpAlarm
    .bind(cpSocketController, cpIo, socket, authResult);
  const cpAlarmGbrSent = cpSocketController.cpAlarmGbrSent
    .bind(cpSocketController, cpIo, socket);
  const cpAlarmClosed = cpSocketController.cpAlarmClosed
    .bind(cpSocketController, cpIo, socket);
  const cpAlarmDecline = cpSocketController.cpAlarmDecline
    .bind(cpSocketController, cpIo, socket);
  const cpRegisterNewCpUser = cpSocketController
    .cpRegisterNewCpUser
    .bind(cpSocketController, socket);
  const cpSignIn = cpSocketController.cpSignIn.bind(cpSocketController, socket);
  socket.on('cpRegisterNewCpUser', cpRegisterNewCpUser);
  socket.on('cpSignIn', cpSignIn);
  socket.on('cpPing', () => {
    logger.info('ping', authResult);
  });
  if (authResult) {
    const { id } = authResult;
    const conObject = { id, socket };
    try {
      const usersIds = openCpIoSockets.map(el => el.id);
      if (usersIds.indexOf(id) !== -1) throw new Error('user with this ID connected');
      openCpIoSockets.push(conObject);
      logger.info(`New ID: ${id} operator connected.`);
      socket.on('cpPickedUpAlarm', cpPickedUpAlarm);
      socket.on('cpAlarmGbrSent', cpAlarmGbrSent);
      socket.on('cpAlarmClosed', cpAlarmClosed);
      socket.on('cpAlarmDecline', cpAlarmDecline);
      socket.on('disconnect', () => {
        openCpIoSockets.splice(openCpIoSockets.indexOf(conObject), 1);
        cpEventEmitter.srvNewUserDisconnected(cpIo, id);
        logger.info(`Cp disconnected operator with ID:${conObject.uid}`);
      });
      cpEventEmitter.srvUpdateAlarmListAll(socket);
      cpEventEmitter.srvUpdateUserList(socket, openCpIoSockets.map(el => el.id));
      cpEventEmitter.srvNewUserConnected(cpIo, id);
    } catch (error) {
      logger.error('error: ', error);
      cpEventEmitter.srvErrMessage(socket, 500, error.message);
    }
  }
});

server.listen(3333, () => {
  logger.info('Application is starting on port 3333');
});
