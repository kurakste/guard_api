module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define('User', {
    firstName: DataTypes.STRING,
    middleName: DataTypes.STRING,
    lastName: DataTypes.STRING,
    email: DataTypes.STRING,
    devId: DataTypes.STRING,
    tel: DataTypes.STRING,
    active: DataTypes.BOOLEAN,
    role: DataTypes.INTEGER,
    img: DataTypes.STRING,
    pasImg1: DataTypes.STRING,
    pasImg2: DataTypes.STRING,
    password: DataTypes.STRING,
    notes: DataTypes.TEXT,
    rebillId: DataTypes.BIGINT,
    isSubscribeActive: DataTypes.BOOLEAN,
    subscriptionId: DataTypes.INTEGER,
    subscriptionStartsAt: DataTypes.DATE,
    master: DataTypes.BOOLEAN,
  }, {});
  User.associate = function(models) {
    User.hasMany(models.Alarm);
  };
  return User;
};
