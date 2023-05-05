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
  let username = req.body.username;
  let password = req.body.password;

  if(!username||!password){
    return res.status(400).json({error: "All fields need to have valid values"});
  }

  try{
    helper.validUserName(username);
    helper.checkPassword(password);
  }catch(e){
    return res.status(400).json({error: e});
  }

  try{
    const checkUser = await usersData.checkUser(username,password);
    if(checkUser){
      req.session.user = {_id: checkUser._id, username: checkUser.username};
      return res.status(200).json({_id:checkUser._id, name:checkUser.name, username:checkUser.username});
    }else{
      res.status(500).json({error: "Internal Server Error"});
    }
  }catch(e){
    res.status(403).json({error: e});
  }
})

module.exports = router;