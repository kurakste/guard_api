const jwt = require('jsonwebtoken');

function auth(token) {
  if (!token) return false;
  try {
    if (!process.env.JWT_KEY) throw new Error('JWT key not exist');
    const res = jwt.verify(token, process.env.JWT_KEY);
    return res;
  } catch (err) {
    return false;
  }
}

module.exports = auth;
