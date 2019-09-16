const jwt = require('jsonwebtoken');

async function authMiddleware(ctx, next) {
  const [event, pl] = ctx;
  const { token, rid } = pl;
  if (
    event === 'cpRegisterNewCpUser' || event === 'cpSignIn'
  ) return next();
  try {
    console.log(' ================== midleware 1');
    if (!token) throw new Error('Auth token is required.');
    if (!process.env.JWT_KEY) throw new Error('JWT key not exist');
    const res = jwt.verify(token, process.env.JWT_KEY);
    // TODO: По хорошему здесь все не правильно. Нужно как-то передавать
    // дальше нужно передать подтвержденный объект пользователя через
    // контекст.
    console.log(`request ID: "${rid}" from user with id: ${res.id}.`);
    await next();
    console.log('------------------- midleware 2');
  } catch (err) {
    console.log(err);
  }
  return null;
}

module.exports = authMiddleware;
