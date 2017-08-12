const express = require('express');
const router = express.Router();
const Property = require('../models/property');

router.get('/', (req, res) => {
  Property
    .find({
      $and : [
        { currentStatus : 'publish' },
        { isActive : true }
      ]
    })
    .sort('-dateAdded')
    .limit(8)
    .exec(function (err, docs) {
      if(err){
        res.json({success : false, msg : 'Failed to list!'});
      } else {
        var data = {
          property: docs,
          title : 'Home - Nepal Agents'
        };
        console.log(data);
        res.render('index',data);
      }
    });
});

module.exports = router;
