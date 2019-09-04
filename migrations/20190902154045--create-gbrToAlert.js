'use strict';
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('GbrsToAlerts', {
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

      AlertId: {
        type: Sequelize.INTEGER,
        references: {
          model: 'Alerts', 
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
    return queryInterface.dropTable('GbrsToAlerts');
  }
};