const express = require('express');
const app = express();
const configRoutes = require('./routes');
const redis = require('redis');
const client = redis.createClient();
client.connect().then(() => {});

const session = require('express-session');
app.use(
  session({
    name: 'AuthCookie',
    secret: "This is a secret.. shhh don't tell anyone",
    saveUninitialized: false,
    resave: false,
    cookie: {maxAge: 365 * 24 * 60 * 60 * 1000}
  })
);

app.use(express.json());
app.use(express.urlencoded({extended: true}));

//cite from stackOverFlow
const logRequest = (req, res, next) => {
  const requestBody = req.body;
  const loggedRequest = {};

  // Redacting password field if present in request body
  Object.entries(requestBody).forEach(([key, value]) => {
    if (key !== 'password') {
      loggedRequest[key] = value;
    }
  });

  console.log('Request Body:', loggedRequest);
  console.log('Request URL:', req.url);
  console.log('Request Method:', req.method); //HTTP verb

  next();
};

app.use(logRequest);

//The fourth will apply to the entire application and will keep track of many times a particular URL has been requested, updating and logging with each request.
//By declaring const urlTracker = {} outside of the function, ensure that only one instance of the urlTracker object is created for the entire application. 
//This means that the state of the object will persist between requests, and the counter will be updated correctly with each request.
const urlTracker = {};
const urlRequestCounter = (req, res, next) => {
  const url = req.url;
  if (!urlTracker[url]) {
    urlTracker[url] = 1;
  } else {
    urlTracker[url] += 1;
  }
  console.log(`The URL ${url} has been requested ${urlTracker[url]} times.`);
  next();
};

app.use(urlRequestCounter);

configRoutes(app); 

app.use('*', (req, res) => {
  res.status(404).json({error: 'Page Not found'});
});

app.listen(3000, () => {
  console.log("We've now got a server!");
  console.log('Your routes will be running on http://localhost:3000');
});
