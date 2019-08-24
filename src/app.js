const Koa = require('koa');
const koaBody = require('koa-body');
const json = require('koa-json');
const router = require('./router');

const app = new Koa();

require('./bootstrap/index');

app.use(koaBody());
app.use(json());
app.use(router.routes());
app.use(router.allowedMethods());

const apiResponseObject = require('./helpers/getApiResponseObject');

app.use(async (ctx) => {
  ctx.body = apiResponseObject(false, '404 Not found', null);
});

const port = process.env.PORT || 4040;
app.listen(port, () => {
  console.log('http://localhost:3030');
});
