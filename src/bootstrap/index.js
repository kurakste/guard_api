
const dotenv = require('dotenv');
dotenv.config()

const dbstring = process.env.DBSTRING 
  || 'postgres://usr:password@localhost:5432/guard';

console.log('dbstring: ', dbstring);

const Sequelize = require('sequelize');
const sequelize = new Sequelize(dbstring);

sequelize
  .authenticate()
  .then(() => {
    console.log('Connection has been established successfully.');
  })
  .catch(err => {
    console.error('Unable to connect to the database:', err);
  });