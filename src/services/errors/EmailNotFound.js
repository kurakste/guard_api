class EmailNotFound extends Error {
  constructor() {
    super();
    this.message = 'Email not found';
    this.name = 'EmailNotFound';
    this.code = 306;
  }
}

module.exports = EmailNotFound;