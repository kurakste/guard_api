'use strict';
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('Alarms', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },

      UserId: {
        type: Sequelize.INTEGER,
        references: {
          model: 'Users', 
          key: 'id'
        }
      },

      track: {
        allowNull: true,
        type: Sequelize.JSON
      },

      regionId: {
        type: Sequelize.INTEGER
      },

      status: {
        type: Sequelize.INTEGER
      },

      oid: {
        allowNull: true,
        type: Sequelize.INTEGER
      },

      pickedUpAt: {
        allowNull: true,
        type: Sequelize.DATE
      },
      
      groupSendAt: {
        allowNull: true,
        type: Sequelize.DATE
      },
      
      declineAt: {
        allowNull: true,
        type: Sequelize.DATE
      },
      
      closedAt: {
        allowNull: true,
        type: Sequelize.DATE
      },

      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },

      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      },

      notes: {
        type: Sequelize.TEXT
      }
    });
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable('Alarms');
  }
};