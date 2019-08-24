const Sequelize = require('sequelize');

const { Model } = Sequelize;
class User extends Model { }
User.init({
  // attributes
  firstName: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  lastName: {
    type: Sequelize.STRING,
    // allowNull defaults to true
  },
},
{
  Sequelize,
  modelName: 'user',
  // options
});
