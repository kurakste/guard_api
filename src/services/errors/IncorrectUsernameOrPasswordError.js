class IncorrectUsernameOrPasswordError extends Error {
  constructor() {
    super();
    this.message = 'Incorrect username or password';
    this.name = 'IncorrectUsernameOrPasswordError';
    this.code = 307;
  }
}

module.exports = IncorrectUsernameOrPasswordError;
