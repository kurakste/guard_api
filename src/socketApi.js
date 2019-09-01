
const Koa = require('koa');
const IO = require('koa-socket-2');
const cors = require('koa-cors');
const controller = require('./socketControllers');

const appSock = new Koa();
const io = new IO();

appSock.use(cors());

io.attach(appSock);

io.on('connection', (socket) => {
  socket.use(async (sk, next) => {
    // here will be RBAC
    // console.log('====>', sk);
    await next();
  });
  console.log('new user connected');

  socket.on('newAlert', controller.newAlert);
  socket.on('trackUpdate', controller.trackUpdate);
  socket.on('alertInWork', controller.alertInWork);
  socket.on('gbrSent', controller.gbrSent);
  socket.on('alertDecline', controller.alertDecline);
  socket.on('alertClose', controller.alertClose);
  socket.on('disconnect', controller.disconnect);
});


appSock.listen(3333, () => {
  console.log('Sockets starts at ws://localhost:3333');
});
