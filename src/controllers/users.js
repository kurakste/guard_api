const apiResponseObject = require('../helpers/getApiResponseObject');
const models = require('../../models');

const { User } = models;

const userController = {
  getUser: async (ctx) => {
    ctx.body = `User controller, User vs ID id: ${ctx.params.id}`;
  },
  // TODO: Check will it work well or no.
  postUser: async (ctx) => {
    const { body } = ctx.request;
    // TODO: What about validation? Use sequelize? Write new function for it?
    const { user } = body;
    if (user) {
      User.create(user)
        .then(usr => {
          // TODO: replace all console.log with loger system.
          console.log(usr);
          const resp = apiResponseObject(true, 'user object must be in request\'s body', { message: 'hellow!' });
          ctx.body = JSON.stringify(resp);
        })
        .catch(err => {
          console.log(err);
          const resp = apiResponseObject(false, err.mesage);
          ctx.body = JSON.stringify(resp);
        });
    } else {
      ctx.body = JSON.stringify(
        apiResponseObject(false, "user object must be in request's body"),
      );
    }
  },

  getAll: async (ctx) => {
    ctx.body = 'Get all users';
  },
};
module.exports = userController;
