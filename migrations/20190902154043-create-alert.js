'use strict';
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('Alerts', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },

      uid: {
        type: Sequelize.INTEGER
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
      
      alertDeclineAt: {
        allowNull: true,
        type: Sequelize.DATE
      },
      
      alertClosedAt: {
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
    return queryInterface.dropTable('Alerts');
  }
};