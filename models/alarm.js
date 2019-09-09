'use strict';
module.exports = (sequelize, DataTypes) => {
  const alarm = sequelize.define('Alarm', {
    UserId: DataTypes.INTEGER,
    track: DataTypes.JSON,
    regionId: DataTypes.INTEGER,
    status: DataTypes.INTEGER,
    oid: DataTypes.INTEGER,
    pickedUpAt: DataTypes.DATE,
    groupSendAt: DataTypes.DATE,
    alarmDeclineAt: DataTypes.DATE,
    alarmClosedAt: DataTypes.DATE,
    createdAt: DataTypes.DATE,
    notes: DataTypes.TEXT,
  }, {});
  alarm.associate = function (models) {
    // associations can be defined here

    alarm.belongsToMany(models.Gbr, { through: 'GbrsToAlarms' });
    alarm.belongsTo(models.User);

  };
  return alarm;
};