'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.addColumn(
      'Alarms',
      'address',
      {
        type: Sequelize.STRING,
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
