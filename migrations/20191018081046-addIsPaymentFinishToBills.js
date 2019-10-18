'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.addColumn(
      'Bills',
      'isPaymentFinished',
      {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      }
    )
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.removeColumn(
      'Bills',
      'isPaymentFinished'
    );
  }
};
