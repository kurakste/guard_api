const apiResponseObject = require('../helpers/getApiResponseObject');
const models = require('../../models');

const { User } = models;

const userController = {
  getUser: async (ctx) => {
    ctx.body = `User controller, User vs ID id: ${ctx.params.id}`;
  },
  postUser: async (ctx) => {
    const { body } = ctx.request;
    // TODO: What about validation? Use sequelize? Write new function for it?
    const { user } = body;
    try {
      const result = await User.create(user);
      const newUser = result.dataValues;
      const output = apiResponseObject(true, '', newUser);
      ctx.body = JSON.stringify(output, null, '\t');
    } catch (err) {
      const output = apiResponseObject(false, err.message, null);
      ctx.body = output;
      console.log(err.message);
    }
  },
  patchUser: async (ctx) => {
    const { body } = ctx.request;
    const { user } = body;
    // TODO: What about validation? Use sequelize? Write new function for it?
    try {
      const updatable = getUserUpdatebleObject(user);
      const [updated] = await User.update(updatable, { where: { id: user.id } });
      if (updated === 0) throw new Error('Record not found in DB.');
      const updatedUser = await User.findByPk(user.id);
      const newUser = updatedUser.dataValues;
      const output = apiResponseObject(true, '', newUser);
      ctx.body = JSON.stringify(output, null, '\t');
    } catch (err) {
      const output = apiResponseObject(false, err.message, null);
      ctx.body = output;
      console.log(err.message);
    }
  },
  deleteUser: async (ctx) => {
    const { params } = ctx;
    const { id } = params;

    console.log(id);
    try {
      if (!id) throw new Error('User id requred.');
      const userFromDb = await User.findByPk(id);
      if (!userFromDb) throw new Error('User not found');
      await userFromDb.destroy();
      const output = apiResponseObject(true, '', { message: 'User was deleted.' });
      ctx.body = output;
    } catch (err) {
      const output = apiResponseObject(false, err.message, null);
      ctx.body = output;
      console.log(err.message);
    }
  },
  getAll: async (ctx) => {
    ctx.body = 'Get all users';
  },
};

function getUserUpdatebleObject(usr) {
  const {
    firstName, lastName, email, notes, tel, active, role, img, pas_img_1, pas_img_2, password,
  } = usr;
  return {
    firstName, lastName, email, notes, tel, active, role, img, pas_img_1, pas_img_2, password,
  };
}
module.exports = userController;
