const express = require('express');
const router = express.Router();

router
.route('/')
.get(async (req, res) => {
    //code here for GET
  if(!req.session.user){
      return res.status(403).json({error:"You haven't login"});
    }
    req.session.destroy();
    res.status(200).json({message: "You have logged out successfully."});
  }); 

  module.exports = router;