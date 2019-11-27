module.exports = (sequelize, DataTypes) => {
  const Subscription = sequelize.define('Subscription', {
    name: DataTypes.STRING, 
    description: DataTypes.STRING,
    cost: DataTypes.NUMERIC,
    lifeTime: DataTypes.INTEGER,
    active: DataTypes.BOOLEAN,
  }, {});
  return Subscription;
};
