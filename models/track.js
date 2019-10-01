'use strict';
module.exports = (sequelize, DataTypes) => {
  const track = sequelize.define('Track', {
    UserId: DataTypes.INTEGER,
    track: DataTypes.JSON,
    isActive: DataTypes.BOOLEAN,
    createdAt: DataTypes.DATE,
    updatedAt: DataTypes.DATE, 
  }, {});
  track.associate = function (models) {
    track.belongsTo(models.User);
  };
  return track;
};