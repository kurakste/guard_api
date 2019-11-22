'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.addColumn(
      'Alarms',
      'callIsPaid',
      {
        type: Sequelize.BOOLEAN,
      }
    )
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.removeColumn(
      'Alarms',
      'callIsPaid'
    ); 
  }
};
