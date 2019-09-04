module.exports = (sequelize, DataTypes) => {
  const Gbr = sequelize.define('Gbr', {
    name: DataTypes.STRING,
    regionId: DataTypes.INTEGER,
    tel: DataTypes.STRING,
    tel1: DataTypes.STRING,
    tel2: DataTypes.STRING,
    notes: DataTypes.TEXT,
  }, {});
  Gbr.associate = function (models) {
    Gbr.belongsToMany(models.Alert, { through: 'GbrsToAlerts' });
  };
  return Gbr;
};
