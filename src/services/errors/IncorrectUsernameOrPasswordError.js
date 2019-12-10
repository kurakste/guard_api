class IncorrectUsernameOrPasswordError extends Error {
  constructor() {
    super();
    this.message = 'Неверное имя пользователя или пароль.';
    this.name = 'IncorrectUsernameOrPasswordError';
    this.code = 307;
  }
}

module.exports = IncorrectUsernameOrPasswordError;
