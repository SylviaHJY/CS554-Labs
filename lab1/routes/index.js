//Here you will require route files and export the constructor method as shown in lecture code and worked in previous labs.
//The app.use() function adds a new middleware to the app. Essentially, whenever a request hits your backend, Express will execute the functions you passed to app.use() in order
const recipeRoutes = require('./recipes');
const signupRoutes = require('./signup');
const loginRoutes = require('./login');
const logoutRoutes = require('./logout');

const constructorMethod = (app) => {
  app.use('/recipes', recipeRoutes);
  app.use('/signup',signupRoutes);
  app.use('/login',loginRoutes);
  app.use('/logout',logoutRoutes);

  app.use('*', (req, res) => {
    res.status(404).json({error: 'Page Not found'});
  });
};

module.exports = constructorMethod;