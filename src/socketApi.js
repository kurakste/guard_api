const Koa = require('koa');
const cors = require('koa-cors');
const http = require('http');
const IO = require('socket.io');
const urlParser = require('url-parameter-parser');
const cpEventEmitter = require('./cpSocketEventEmitter');
const appEventEmitter = require('./appSocketEventEmitter');
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

appIo.on('connection', async (socket) => {
  logger.info('New app user connected.');
  const params = urlParser(socket.request.url);
  const { token } = params;
  const authResult = await auth(token, socket);
  const { res, user } = authResult;

  if (res) {
    logger.info('New app login successful');
    appEventEmitter.srvSendAppState(socket, user);
    const appNewTrack = appSocketController
      .appNewTrack
      .bind(appSocketController, cpIo, socket, user);
    const appNewAlarm = appSocketController
      .appNewAlarm
      .bind(appSocketController, cpIo, socket);
    const appNewPointInAlarmTrack = appSocketController
      .appNewPointInTrack
      .bind(appSocketController, cpIo, socket);
    logger.info('New app user connected.');
    socket.on('appNewTrack', appNewTrack);
    socket.on('appNewAlarm', appNewAlarm);
    socket.on('appNewPointInAlarmTrack', appNewPointInAlarmTrack);
    socket.on('disconnect', appSocketController.disconnect);
  } else {
    appEventEmitter.srvErrMessage(socket, 302, 'Auth error. Check your token.');
  }
});


const openCpIoSockets = [];

cpIo.on('connection', (socket) => {
  const params = urlParser(socket.request.url);
  const { token } = params;
  const authResult = auth(token, socket);
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
    .bind(cpSocketController, cpIo, socket);
  const cpSignIn = cpSocketController.cpSignIn
    .bind(cpSocketController, socket);
  const cpAppUserApprove = cpSocketController.cpAppUserApprove
    .bind(cpSocketController, socket, cpIo);
  const cpAppUserDecline = cpSocketController.cpAppUserDecline
    .bind(cpSocketController, socket, cpIo);
  const cpCpUserApprove = cpSocketController.cpCpUserApprove
    .bind(cpSocketController, socket, cpIo);
  const cpCpUserDecline = cpSocketController.cpCpUserDecline
    .bind(cpSocketController, socket, cpIo);

  socket.on('cpRegisterNewCpUser', cpRegisterNewCpUser);
  socket.on('cpSignIn', cpSignIn);
  socket.on('cpPing', () => {
    logger.info('ping', authResult);
  });
  if (authResult.res) {
    const { id } = authResult.user;
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
      socket.on('cpAppUserApprove', cpAppUserApprove);
      socket.on('cpAppUserDecline', cpAppUserDecline);
      socket.on('cpCpUserApprove', cpCpUserApprove);
      socket.on('cpCpUserDecline', cpCpUserDecline);
      socket.on('disconnect', () => {
        openCpIoSockets.splice(openCpIoSockets.indexOf(conObject), 1);
        cpEventEmitter.srvNewUserDisconnected(cpIo, id);
        logger.info(`Cp disconnected operator with ID:${conObject.uid}`);
      });
      // TODO: rename it to srvSendAlarmListAll;
      cpEventEmitter.srvUpdateAlarmListAll(socket);
      // TODO: rename it to srvSendActiveCpUsers
      cpEventEmitter.srvUpdateUserList(socket, openCpIoSockets.map(el => el.id));
      cpEventEmitter.srvSendAllCpUserListForOneCpUser(socket);
      cpEventEmitter.srvSendAllAppUserListForOneCpUser(socket);
      cpEventEmitter.srvNewUserConnected(cpIo, id);
    } catch (error) {
      logger.error('error: ', error);
      cpEventEmitter.srvErrMessage(socket, 500, error.message);
    }
  } else {
    cpEventEmitter.srvErrMessage(socket, authResult.code, authResult.msg);
  }
});

server.listen(3333, () => {
  logger.info('Application is starting on port 3333');
});
