'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
   return queryInterface.createTable('Bills', {

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

    operationType: {
      allowNull: true,
      type: Sequelize.STRING, 
    },

    sum: {
      type: Sequelize.NUMERIC,
    },

    comment: {
      allowNull: true,
      type: Sequelize.STRING
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
    return queryInterface.dropTable('Bills');
  }
};
