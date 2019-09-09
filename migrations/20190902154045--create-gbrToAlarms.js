'use strict';
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('GbrsToAlarms', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },

      GbrId: {
        type: Sequelize.INTEGER,
        references: {
          model: 'Gbrs', 
          key: 'id'
        } 
      },

      AlarmId: {
        type: Sequelize.INTEGER,
        references: {
          model: 'Alarms', 
          key: 'id'
        }
      },

      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable('GbrsToalArms');
  }
};