'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.addColumn(
      'Users',
      'autoSubscriptions',
      {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      }
    )
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.removeColumn(
      'Users',
      'autoSubscriptions'
    );
  }
};
