'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.addColumn(
      'Users',
      'rebillId',
      {
        type: Sequelize.BIGINT,
      }
    )
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.removeColumn(
      'Users',
      'rebillId'
    ); 
  }
};
