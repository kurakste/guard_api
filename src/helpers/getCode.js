const rnd = require('random-number');

function getCode() {
  const options = {
    min: 1000,
    max: 9999,
    integer: true,
  };
  return rnd(options);
}

module.exports = getCode;
