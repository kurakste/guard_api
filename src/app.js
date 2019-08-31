const Koa = require('koa');
const IO = require('koa-socket-2');
const koaBody = require('koa-body');
const json = require('koa-json');
const statServer = require('koa-static-server');
const cors = require('koa-cors');
const router = require('./router');

const app = new Koa();

require('./bootstrap');

app.use(koaBody({
  formidable: {
    keepExtensions: true,
    uploadDir: './uploads',
  }, // This is where the files would come
  multipart: true,
  urlencoded: true,
}));
app.use(statServer({
  rootDir: 'public/img',
  rootPath: '/img',
}));
app.use(cors());
app.use(json());
app.use(router.routes());
app.use(router.allowedMethods());

const apiResponseObject = require('./helpers/getApiResponseObject');

app.use(async (ctx) => {
  ctx.body = apiResponseObject(false, '404 Not found', null);
});

const port = process.env.PORT || 4040;
app.listen(port, () => {
  console.log(`http://localhost:${port}`);
});


const appSock = new Koa();
const io = new IO();

appSock.use();
io.attach(appSock);

io.on('message', (ctx, data) => {
  console.log('client sent data to message endpoint', data);
});

app.listen(3333, () => {
  console.log('Sockets starts in 3333 post');
});