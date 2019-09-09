'use strict';
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('Gbrs', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      
      regionId: {
        type: Sequelize.INTEGER
      },

      name: {
        type: Sequelize.STRING
      },

      tel: {
        type: Sequelize.STRING
      },
      
      tel1: {
        type: Sequelize.STRING
      },
      
      tel2: {
        type: Sequelize.STRING
      },

      notes: {
        type: Sequelize.TEXT
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
    return queryInterface.dropTable('Gbrs',{
      force: true,
      cascade: true,
    });
  }
};