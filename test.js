const models = require('./models');

const { User } = models;

User.create({
  firstName: 'Igor',
  lastName: 'Petrov',
  email: 'petrov@gmail.com',
});


models.User.findAll()
  .then(pr => console.log(pr))
  .catch(err=> console.log(err.message));

