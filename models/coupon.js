module.exports = (sequelize, DataTypes) => {
  const Coupon = sequelize.define('Coupon', {
    couponId: DataTypes.STRING,
    UserId: DataTypes.INTEGER,
    isDone: DataTypes.BOOLEAN,
    subscriptionType: DataTypes.INTEGER,
    comment: DataTypes.STRING,
  }, {});
  return Coupon;
};