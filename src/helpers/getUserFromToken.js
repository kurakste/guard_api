const getUserFromToken = (token) => {
  const { user } = token;
  return user;
};

module.exports = getUserFromToken;
