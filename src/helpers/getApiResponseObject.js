module.exports = function getApiResponseObject(success, message, payload, errorCode = null) {
  return {
    success, message, payload, errorCode,
  };
};
