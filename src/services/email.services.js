const nodemailer = require('nodemailer');
const logger = require('../helpers/logger');

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


async function sendCodeToEmail(code, email) {
  await transporter.sendMail({
    from: '<kurakste@yandex.ru>', // sender address
    to: email, // list of receivers
    subject: 'Восстановление пароля.', // Subject line
    html: `<p>Ваш код восстановления пароля: ${code}.</p>`,
  });

  logger.info(`Code ${code} was sent to user ${email}`);
}

async function sendTrackToEmail(email, track) {
  logger.indexOf('sendTrackToEmail: ', { email, track });
  await transporter.sendMail({
    from: '<kurakste@yandex.ru>', // sender address
    to: email, // list of receivers
    subject: 'Запрос трека за день.', // Subject line
    html: `<p> ${track} </p>`,
  });

  logger.info(`Track was sent to ${email}`);
}

// send mail with defined transport object
module.exports = { sendCodeToEmail, sendTrackToEmail };
