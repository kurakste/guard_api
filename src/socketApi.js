
const Koa = require('koa');
const IO = require('koa-socket-2');
const cors = require('koa-cors');

const appSock = new Koa();
const io = new IO();

appSock.use(cors());

io.attach(appSock);

io.on('connection', (socket) => {
  socket.use(async (sk, next) => {
    // here will be RBAC 
    console.log('====>', sk);
    await next();
  });
  socket.on('username', (data) => {
    socket.username = data;
    console.log(`🔵 ${socket.username} join the chat..`);
    socket.broadcast.emit('message', { username: 'sys', message: `🔵 ${socket.username} join the chat..` });
  });
  console.log('new connection');
  socket.on('message', (data) => {
    console.log('client sent data to message endpoint: \n', data);
    io.socket.emit('message', { username: socket.username, message: data });
  });
  socket.on('disconnect', () => {
    console.log(`🔴 ${socket.username} disconnected...`);
    socket.broadcast.emit('message', { username: 'sys', message: `🔴 ${socket.username} disconnected...` });
  });
});


appSock.listen(3333, () => {
  console.log('Sockets starts at ws://localhost:3333');
});
// 🔴, 🔵, ❤ , 😉
