'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('Tracks', {

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
  
      isActive: {
        type: Sequelize.BOOLEAN,
        defaultValue: true,
      },
  
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
  
    });
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable('Tracks', {
      force: true,
      cascade: true,
    });
  }
};
