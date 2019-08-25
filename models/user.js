'use strict';
module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define('User', {
    firstName: DataTypes.STRING,
    lastName: DataTypes.STRING,
    email: DataTypes.STRING,
    tel: DataTypes.STRING,
    active: DataTypes.BOOLEAN,
    img: DataTypes.STRING,
    pas_img_1: DataTypes.STRING,
    pas_img_2: DataTypes.STRING,
    password: DataTypes.STRING,
    notes: DataTypes.TEXT
  }, {});
  User.associate = function(models) {
    // associations can be defined here
  };
  return User;
};