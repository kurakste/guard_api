const Transport = require('winston-transport');

module.exports = class YourCustomTransport extends Transport {
  constructor(opts) {
    super(opts);
    const { appIo } = opts;
    this.appIo = appIo;
  }

  log(info, callback) {
    setImmediate(() => {
      this.emit('logged', info);
      this.appIo.emit('logger', info);
    });

    callback();
  }
};
