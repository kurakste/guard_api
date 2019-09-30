module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define('Bill', {
    UserId: DataTypes.INTEGER,
    operationType: DataTypes.STRING,
    sum:DataTypes.NUMERIC,
    comment: DataTypes.STRING,
  }, {});
  User.associate = function(models) {
    User.hasMany(models.Bill);
  };
  return User;
};