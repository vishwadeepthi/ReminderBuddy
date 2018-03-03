const Sequelize = require('sequelize');
const path = require("path");
const sequelize = new Sequelize('database', 'username', 'password', {
  host: 'localhost',
  dialect: 'sqlite',
  operatorsAliases: false,
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000
  },

  // SQLite only
  storage: path.join(__dirname,'../database.sqlite')
});

module.exports = sequelize;