const express = require('express');
const router = express.Router();

router.get('/',function(req,res){
  const data = {
    title : 'Nepal Agents'
  }
  res.render('index',data);
});

module.exports = router;
