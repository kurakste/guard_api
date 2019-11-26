module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define('Bill', {
    UserId: DataTypes.INTEGER,
    operationType: DataTypes.STRING,
    sum:DataTypes.NUMERIC,
    comment: DataTypes.STRING,
    isPaymentFinished: DataTypes.BOOLEAN,
  }, {});
  return User;
};