'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.addColumn(
      'Alarms',
      'subscriptionIsPaid',
      {
        type: Sequelize.BOOLEAN,
      }
    )
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.removeColumn(
      'Alarms',
      'subscriptionIsPaid'
    ); 
  }
};
