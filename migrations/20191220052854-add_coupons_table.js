'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
   return queryInterface.createTable('Coupons', {

    id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: Sequelize.INTEGER
    },

    couponId: {
      unique: true,
      allowNull: false,
      type: Sequelize.STRING
    },

    UserId: {
      allowNull: true,
      type: Sequelize.INTEGER,
    },

    isDone: {
      type: Sequelize.BOOLEAN,
    },

    subscriptionType: {
      allowNull: false,
      type: Sequelize.INTEGER,
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
    return queryInterface.dropTable('Coupons');
  }
};
