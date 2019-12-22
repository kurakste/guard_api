'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.addColumn(
      'Gbrs',
      'zips',
      {
        type: Sequelize.JSONB,
      }
    )
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.removeColumn(
      'Gbrs',
      'zips'
    ); 
  }
};

