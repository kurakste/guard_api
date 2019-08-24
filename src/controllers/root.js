const controller = {
  root: async (ctx, next) => {
    ctx.body = `Root route`
  },
  root_a: async (ctx, next) => {
    ctx.body = `Root route /a.`
  }
}

module.exports = controller;