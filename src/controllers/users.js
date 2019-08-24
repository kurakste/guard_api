const apiResponseObject = require('../helpers/getApiResponseObject');

const userController = {
  getUser: async (ctx) => {
    ctx.body = `User controller, User vs ID id: ${ctx.params.id}`;
  },
  postUser: async (ctx) => {
    const { body } = ctx.request;
    const { user } = body;
    if (!user) {
      ctx.body = JSON.stringify(
        apiResponseObject(false, "user object must be in request's body")
      );
      return;
    }

    console.log(user);
    ctx.body = `Post User: ${JSON.stringify(user, null, '\t')}`;
  },

  getAll: async (ctx) => {
    ctx.body = 'Get all users';
  },
};
module.exports = userController;
