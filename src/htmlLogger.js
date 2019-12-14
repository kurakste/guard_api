const logger = require('./helpers/logger');

module.exports = async (ctx, next) => {
  const { request } = ctx;
  const { url, method } = request;
  const start = Date.now();
  await next();
  const stop = Date.now();
  const diff = stop - start;
  logger.info(`${method} - ${url} - ${diff} ms`);
};
