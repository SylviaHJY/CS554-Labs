const {ObjectId} = require('mongodb');
const mongoCollections = require('../config/mongoCollections');
const users = mongoCollections.users;
const helper = require("../helper.js");
const bcrypt = require('bcryptjs');
const saltRounds = 10;

const createUser = async (
  name,
  username,
  password
) => {
  if(!username || !password){
    throw 'All fields need to have valid values.'
  }

  //check name
  helper.checkIsString(name);
  helper.checkName(name);
  name = name.trim();

  //check username:
  helper.validUserName(username);
  username = username.trim();

  //check password
  helper.checkPassword(password);

  //check duplicated username:
  const usersCollection = await users();
  const user = await usersCollection.findOne({username: username.toLowerCase()});
  if(user) throw 'This user name cannot be registered.There is already a user with that username.'

  //hash password
  const hashPassword = await bcrypt.hash(password,saltRounds);

  //insert the username and hashed password into database.
  //create user
  let newUser = {
    name: name,
    username : username.toLowerCase(),
    password : hashPassword
  }

  const insertInfo = await usersCollection.insertOne(newUser);
  if (insertInfo.insertedCount === 0) throw 'Could not add user';

  const newId = insertInfo.insertedId.toString();
  const user1 = await getUserById(newId);
  return user1; 
}

//cite from my previous cs546 lab6
const getAllUsers = async () => {
  const usersCollection = await users();
  const userList = await usersCollection.find({}).toArray();
  for (let i = 0; i < userList.length; i++) {
    userList[i]._id = userList[i]._id.toString();
  }
  if (!userList) movieList = [];
  return userList;
};

const getUserById = async (userId) => {
  if (!userId) throw 'You must provide an id to search for';
  //check to make sure it's a string
  if (typeof userId !== 'string') throw 'Id must be a string';

  //check to make sure it's not all spaces
  if (userId.trim().length === 0) throw 'Id cannot be an empty string or just spaces';

  //Now we check if it's a valid ObjectId so we attempt to convert a value to a valid object ID,
  userId = userId.trim();
  if (!ObjectId.isValid(userId)) throw 'invalid object ID';
  userId = userId.trim();

  const userCollection = await users();
  const user = await userCollection.findOne({ _id: ObjectId(userId) });
  if (user === null) throw 'User not found';
  user._id = user._id.toString();
  return user;
};

const getUserByName = async (username) => {
  if (!username) throw 'You must provide an user name to search for';
  helper.validUserName(username);
  const userCollection = await users();
  const user = await userCollection.findOne({ userName: username });
  if (!user) throw "User does not exist";
  user._id = user._id.toString();
  return user;
};

//cite from my previous cs546 lab10
const checkUser = async (username, password) => {
  if(!username || !password){
    throw 'All fields need to have valid values.'
  }

  //check username
  helper.validUserName(username);

  //check password
  helper.checkPassword(password);

  //Query the db for the username supplied, if it is not found, throw an error
  const usersCollection = await users();
  const user = await usersCollection.findOne({username: username.toLowerCase()});
  if(user === null) throw 'Either the username or password is invalid.'

  const compareToPassword = await bcrypt.compare(password,user.password);
  if(compareToPassword){
    user._id = user._id.toString();
    return user;
  }else{
    throw 'Either the username or password is invalid.'
  }
};

module.exports = {
  createUser, 
  getAllUsers, 
  getUserById, 
  getUserByName, 
  checkUser};
