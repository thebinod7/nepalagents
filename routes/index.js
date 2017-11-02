const express = require('express');
const router = express.Router();
const Property = require('../models/property');
const format = require('../utils/format');

router.get('/', (req, res) => {
  Property
    .find({
      $and : [
        { currentStatus : 'publish' },
        { isActive : true }
      ]
    })
    .sort('-dateAdded')
    .limit(4)
    .exec(function (err, docs) {
      if(err){
        res.json({success : false, msg : 'Failed to list!'});
      } else {
        var data = {
          property: docs,
          title : 'Home - Nepal Agents',
          format
        };
        res.render('index',data);
      }
    });
});

module.exports = router;
