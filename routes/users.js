const express = require('express');
const router = express.Router();

router.get('/signup',function(req,res){
  const data = {
    title : "NA - Signup"
  }
  res.render('users/signup', data);
});

module.exports = router;
