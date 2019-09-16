async function authMiddleware(ctx, next) {
  const [event, payload] = ctx;
  const {token, user, apPayload } = payload;
  if (
    event === 'cpRegisterNewCpUser' || event === 'cpSignIn'
  ) return next();
  try {
    console.log(' ================== midleware 1', event);
    if (!token) throw new Error('Auth token is required.');
    await next();
    console.log('------------------- midleware 2', payload);

  } catch (err) {
    console.log(err);

  }
}

module.exports = authMiddleware;
