const recipeRoutes = require('./recipes');
const signupRoutes = require('./signup');
const loginRoutes = require('./login');
const logoutRoutes = require('./logout');

const constructorMethod = (app) => {
  app.use('/', recipeRoutes);
  app.use('/signup',signupRoutes);
  app.use('/login',loginRoutes);
  app.use('/logout',logoutRoutes);
};

module.exports = constructorMethod;
