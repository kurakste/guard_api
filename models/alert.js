'use strict';
module.exports = (sequelize, DataTypes) => {
  const Alert = sequelize.define('Alert', {
    uid: DataTypes.INTEGER,
    track: DataTypes.JSON,
    regionId: DataTypes.INTEGER,
    status: DataTypes.INTEGER,
    oid: DataTypes.INTEGER,
    pickedUpAt: DataTypes.DATE,
    groupSendAt: DataTypes.DATE,
    alertDeclineAt: DataTypes.DATE,
    alertClosedAt: DataTypes.DATE,
    createdAt: DataTypes.DATE, 
    notes: DataTypes.TEXT,
  }, {});
  Alert.associate = function(models) {
    // associations can be defined here
  };
  return Alert;
};