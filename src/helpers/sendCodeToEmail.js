const nodemailer = require('nodemailer');
const logger = require('./logger');

async function sendCodeToEmail(code, email) {
  const login = process.env.MAILLOGIN;
  const password = process.env.MAILPASSWORD;

  if (!(login && password)) throw new Error('MAILLOGIN, MAILPASSWORD has to be set in .env');

  const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true, // true for 465, false for other ports
    auth: {
      user: login, // generated ethereal user
      pass: password, // generated ethereal password
    },
  });

  await transporter.sendMail({
    from: '<kurakste@yandex.ru>', // sender address
    to: email, // list of receivers
    subject: 'Password recovery', // Subject line
    html: `<p>Your password recovery code is: ${code}.</p>`,
  });

  logger.info(`Code ${code} was sent to user ${email}`);
}

// send mail with defined transport object
module.exports = sendCodeToEmail;
