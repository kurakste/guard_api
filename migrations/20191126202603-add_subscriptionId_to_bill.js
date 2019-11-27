'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.addColumn(
      'Bills',
      'subscriptionId',
      {
        type: Sequelize.INTEGER,
      }
    )
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.removeColumn(
      'Bills',
      'subscriptionId'
    ); 
  }
};
