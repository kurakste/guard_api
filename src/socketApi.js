
const Koa = require('koa');
const IO = require('koa-socket-2');
const cors = require('koa-cors');
const controller = require('./socketControllers');

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

const newAlert = controller.newAlert.bind(controller, cpIo);

appIo.on('connection', (socket) => {
  console.log('New user connected.');
  socket.on('newAlert', newAlert);
  socket.on('trackUpdate', controller.trackUpdate);
  socket.on('alertInWork', controller.alertInWork);
  socket.on('gbrSent', controller.gbrSent);
  socket.on('alertDecline', controller.alertDecline);
  socket.on('alertClose', controller.alertClose);
  socket.on('disconnect', controller.disconnect);
});

cpIo.on('connection', (socket) => {
  console.log('New operator connected.');
});


appSock.listen(3333, () => {
  console.log('Sockets starts at ws://localhost:3333');
});
