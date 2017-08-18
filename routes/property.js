const express = require('express');
const router = express.Router();
const Users= require('../models/users');
const Property= require('../models/property');
const nodemailer = require('nodemailer');
const session = require('express-session');
const jwt = require('jsonwebtoken');
const auth = require('../utils/authenticate').auth;
const loggedIn = require('../utils/authenticate').loggedIn;
const multer  = require('multer');

const dashboardLayoutData = {
  layout: 'layouts/dashboard'
};

const relatedListings = function(status) {
  return Property.find({
    status
  });
};

var storage = multer.diskStorage({
  destination: './public/assets/img/uploads/',
  filename (req, file, cb) {
    cb(null,
      file.fieldname + '-' + Date.now() + '.' +
      file.originalname.split('.')[file.originalname.split('.').length - 1]
    );
  }
});

const upload = multer({ storage });

router.post('/uploadImages', upload.single('file'), function(req, res) {
  res.json({
    error: false,
    result: req.file.filename
  });
});

router.get('/add', auth, function(req,res){
  const data = Object.assign(dashboardLayoutData, {
        title:  'Property - Add'
      });
    res.render('property/add', data);
});

router.get('/listings', auth, function(req,res){
  Property
    .find({
      $and : [
        { currentStatus : 'publish' },
        { isActive : true }
      ]
    })
    .sort('-dateAdded')
    .exec(function (err, docs) {
      if(err){
        res.json({success : false, msg : 'Failed to list!'});
      } else {
        var data = {
          property: docs,
          count : docs.length,
          title : 'Property - listings'
        };
        res.render('property/listings',data);
      }
    });
});

router.get('/view/:id', (req, res) => {
  Property.findById(req.params.id)
  .populate('userId')
  .exec((err, doc) => {
    if(err) throw err;
    relatedListings(doc.status)
    .limit(4)
    .exec(function(err, related) {
      console.log(doc.userId);
      Users.findOne({ userId: doc.userId._id }).exec((err, agent) => {
        console.log(agent);
        const images = [doc.featuredImgUrl].concat(doc.images.filter(i => i.length));
        res.render('property/details', {
          data: doc,
          title: 'Property Details',
          list:related,
          images,
          agent
        });
      });
    });
  });
});

router.post('/save', (req, res) => {
  const images = req.body.images.split(',');
  const amenities = req.body.amenities.split(',');

  const featuredImgUrl = images[0];
  images.splice(0, 1);

  const payload = Object.assign({}, req.body, {
    featuredImgUrl,
    images,
    amenities,
    userId : req.session.userId,
  });
  const property = new Property(payload);
  property.save((err) => {
    if(err) {
      console.log(err);
      req.flash('error', 'ERROR! Failed to add property listing');
      res.redirect('/property/add');
    } else {
      req.flash('success', 'SUCCESS! Property listing added successfully!');
      res.redirect('/property/add');
    }
  });
});

router.get('/list', (req, res) => {
  Property
    .find()
    .exec(function (err, docs) {
      if(err){
        res.json({success : false, msg : 'Failed to list!'});
      } else {
        res.json({success:true,msg:'Success',result:docs});
      }
    });
});

router.delete('/delete/:id',function (req,res) {
  Property.remove({ _id: req.params.id }, function(err,docs) {
    if (err) throw err;

    res.json({success : true, msg :'Success', result : docs});
    // req.flash('success', 'SUCCESS! Property deleted successfully!');
    // res.redirect('/estate/my-listings');
  });
});

module.exports = router;
