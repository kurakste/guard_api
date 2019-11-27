'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return [
      queryInterface.addColumn(
        'Users',
        'isSubscribeActive',
        Sequelize.BOOLEAN,
      ),
      queryInterface.addColumn(
        'Users',
        'subscriptionId',
        Sequelize.INTEGER,
      ),
      queryInterface.addColumn(
        'Users',
        'subscriptionStartsAt',
        Sequelize.DATE
      ),
    ]
  },

  down: async (queryInterface, Sequelize) => {
    return [
      queryInterface.removeColumn(
        'Users',
        'isSubscribeActive'
      ),
      queryInterface.removeColumn(
        'Users',
        'subscriptionId'
      ),
      queryInterface.removeColumn(
        'Users',
        'subscriptionStartsAt'
      ),
    ];
  }
};
