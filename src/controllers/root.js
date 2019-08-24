const controller = {
  root: async (ctx) => {
    ctx.body = 'Root route';
  },
  root_a: async (ctx) => {
    ctx.body = 'Root route /a.';
  },
};

module.exports = controller;
