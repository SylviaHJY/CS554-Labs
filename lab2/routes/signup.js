const express = require('express');
const router = express.Router();
const data = require('../data');
const helper = require("../helper.js");
const usersData = data.users;

router
.route('/')
.post(async (req, res) => {
  if(req.session.user){
    return res.status(403).json({error: "You have logged in!"});
  }

  let name = req.body.name;
  let username = req.body.username;
  let password = req.body.password;

  if(!name || !username || !password){
    return res.status(400).json({error: "All fields need to have valid values"});
  }

  try{
    helper.checkIsString(name);
    helper.checkName(name);
    helper.validUserName(username);
    helper.checkPassword(password);
  }catch(e){
    return res.status(400).json({error: e});
  }

  try{
    const createUser = await usersData.createUser(name,username,password);
    if(createUser){
      return res.status(200).json({_id:createUser._id, name:createUser.name, username:createUser.username});
    }else{
      res.status(500).json({error: "Internal Server Error"});
    }
  }catch(e){
    console.error('Error:', e);
    res.status(401).json({error: e});
  }
});

module.exports = router;