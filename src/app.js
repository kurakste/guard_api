const Koa = require('koa');
const koaBody = require('koa-body');
const json = require('koa-json');
const statServ = require('koa-static-server');
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
console.log('dir:', __dirname);
app.use(statServ({
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
