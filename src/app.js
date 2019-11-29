const Koa = require('koa');
const koaBody = require('koa-body');
const json = require('koa-json');
const statServer = require('koa-static-server');
const cors = require('@koa/cors');
const dotenv = require('dotenv');
const router = require('./router');
const logger = require('./helpers/logger');

dotenv.config();

require('./socketApi');

const app = new Koa();

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
app.use(statServer({
  rootDir: 'public/css',
  rootPath: '/css',
}));
app.use(statServer({
  rootDir: 'public/font',
  rootPath: '/font',
}));
app.use(statServer({
  rootDir: 'public/html',
  rootPath: '/html',
}));
app.use(statServer({
  rootDir: 'public/assets',
  rootPath: '/assets',
}));
app.use(statServer({
  rootDir: 'public/scripts',
  rootPath: '/scripts',
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
  logger.info(`http://localhost:${port}`);
});
