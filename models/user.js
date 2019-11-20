module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define('User', {
    firstName: DataTypes.STRING,
    middleName: DataTypes.STRING,
    lastName: DataTypes.STRING,
    email: DataTypes.STRING,
    tel: DataTypes.STRING,
    active: DataTypes.BOOLEAN,
    role: DataTypes.INTEGER,
    img: DataTypes.STRING,
    pasImg1: DataTypes.STRING,
    pasImg2: DataTypes.STRING,
    password: DataTypes.STRING,
    notes: DataTypes.TEXT,
    balance: DataTypes.NUMERIC,
    autoSubscriptions: DataTypes.BOOLEAN, 
    lowBallance: DataTypes.BOOLEAN,
    rebillId: DataTypes.BIGINT, 
  }, {});
  User.associate = function(models) {
    User.hasMany(models.Alarm);
  };
  return User;
};
