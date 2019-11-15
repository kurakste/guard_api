
class NotActiveUserError extends Error {
  constructor() {
    super();
    this.message = 'User doesn\'t active. Contact the server administrator';
    this.name = 'NotActiveUserError';
    this.code = 308;
  }
}

module.exports = NotActiveUserError;
