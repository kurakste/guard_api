const winston = require('winston');

const { format } = winston;
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.Console({
      format: format.combine(
        format.timestamp(),
        format.colorize(),
        format.simple(),
      ),
    }),
    new winston.transports.File({ filename: 'log/combined.log' }),
  ],
});

module.exports = logger;
