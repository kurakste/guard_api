const Koa = require('koa');
const cors = require('@koa/cors');
const http = require('http');
const IO = require('socket.io');
const urlParser = require('url-parameter-parser');
const cpEventEmitter = require('./cpSocketEventEmitter');
const appEventEmitter = require('./appSocketEventEmitter');
const cpSocketController = require('./socketControllers/сpSocketController');
const appSocketController = require('./socketControllers/appSocketController');
const auth = require('./middleware/auth');
const logger = require('./helpers/logger');
const ToSocketTransport = require('./helpers/loggerToSocket');

const appSock = new Koa();
appSock.use(cors());

const server = http.createServer(appSock.callback());
const io = IO(server);
const cpIOBus = io.of('/cp-clients');
const appIOBus = io.of('/app-clients');

const toSocketTransport = new ToSocketTransport({ appIo: appIOBus });
logger.add(toSocketTransport);


appIOBus.on('connection', async (socket) => {
  const params = urlParser(socket.request.url);
  const { token } = params;
  logger.info('New app user connected with params:', { params });
  const authResult = await auth(token, socket);
  const { res, user } = authResult;
  if (res) {
    logger.info('New app login successful', { id: user.id });

    appEventEmitter.srvSendAppState(socket, user);
    const addNewPosition = appSocketController
      .addNewPosition
      .bind(appSocketController, cpIOBus, socket, user);
    const appNewAlarm = appSocketController
      .appNewAlarm
      .bind(appSocketController, cpIOBus, socket, user);
    const appHeartBeat = appSocketController
      .appHeartBeat
      .bind(appSocketController, socket, user);
    // const appAddNewPointInAlarmTrack = appSocketController
    //   .appAddNewPointInAlarmTrack
    //   .bind(appSocketController, cpIOBus, socket, user);

    const appCancelAlarm = appSocketController
      .appCancelAlarm
      .bind(appSocketController, cpIOBus, socket, user);

    socket.on('addNewPosition', addNewPosition);
    socket.on('appNewAlarm', appNewAlarm);
    // socket.on('appAddNewPointInAlarmTrack', appAddNewPointInAlarmTrack);
    socket.on('appCancelAlarm', appCancelAlarm);
    socket.on('heartBeat', appHeartBeat);
    socket.on('disconnect', appSocketController.disconnect);
  } else {
    appEventEmitter.srvErrMessage(socket, 302, 'Auth error. Check your token.');
  }
});

const openCpIoSockets = [];

cpIOBus.on('connection', async (socket) => {
  const params = urlParser(socket.request.url);
  const { token } = params;
  const authResult = await auth(token, socket);
  logger.info('user connected', params, token, authResult);
  const cpPickedUpAlarm = cpSocketController.cpPickedUpAlarm
    .bind(cpSocketController, cpIOBus, socket, authResult);
  const cpAlarmGbrSent = cpSocketController.cpAlarmGbrSent
    .bind(cpSocketController, cpIOBus, socket);
  const cpAlarmClosed = cpSocketController.cpAlarmClosed
    .bind(cpSocketController, cpIOBus, socket);
  const cpAlarmDecline = cpSocketController.cpAlarmDecline
    .bind(cpSocketController, cpIOBus, socket);
  const cpRegisterNewCpUser = cpSocketController
    .cpRegisterNewCpUser
    .bind(cpSocketController, cpIOBus, socket);
  const cpSignIn = cpSocketController.cpSignIn
    .bind(cpSocketController, socket);
  const cpAppUserApprove = cpSocketController.cpAppUserApprove
    .bind(cpSocketController, socket, cpIOBus);
  const cpAppUserDecline = cpSocketController.cpAppUserDecline
    .bind(cpSocketController, socket, cpIOBus);
  const cpCpUserApprove = cpSocketController.cpCpUserApprove
    .bind(cpSocketController, socket, cpIOBus);
  const cpCpUserDecline = cpSocketController.cpCpUserDecline
    .bind(cpSocketController, socket, cpIOBus);
  const cpGiveMeUserList = cpSocketController.cpGiveMeUserList
    .bind(cpSocketController, socket);

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
      socket.on('cpGiveMeUserList', cpGiveMeUserList);
      socket.on('disconnect', () => {
        openCpIoSockets.splice(openCpIoSockets.indexOf(conObject), 1);
        cpEventEmitter.srvNewUserDisconnected(cpIOBus, id);
        logger.info(`Cp disconnected operator with ID:${conObject.uid}`);
      });
      // TODO: rename it to srvSendAlarmListAll;
      cpEventEmitter.srvUpdateAlarmListAll(socket);
      // TODO: rename it to srvSendActiveCpUsers
      cpEventEmitter.srvUpdateUserList(socket, openCpIoSockets.map(el => el.id));
      cpEventEmitter.srvSendAllCpUserListForOneCpUser(socket);
      cpEventEmitter.srvSendAllAppUserListForOneCpUser(socket);
      cpEventEmitter.srvNewUserConnected(cpIOBus, id);
    } catch (error) {
      logger.error('error: ', error.message);
      cpEventEmitter.srvErrMessage(socket, 500, error.message);
    }
  } else {
    cpEventEmitter.srvErrMessage(socket, authResult.code, authResult.msg);
  }
});

server.listen(3333, () => {
  logger.info('Application is starting on port 3333');
});

module.exports = { cpIOBus, appIOBus };
