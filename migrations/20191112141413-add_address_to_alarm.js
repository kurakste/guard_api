'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.addColumn(
      'Alarms',
      'address',
      {
        type: Sequelize.TEXT,
      }
    )
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.removeColumn(
      'Alarms',
      'address'
    );
  }
};
