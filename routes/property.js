const express = require('express');
const router = express.Router();
const Users= require('../models/users');
const Membership= require('../models/membership');
const Property= require('../models/property');
const nodemailer = require('nodemailer');
const session = require('express-session');
const jwt = require('jsonwebtoken');
const auth = require('../utils/authenticate').auth;
const loggedIn = require('../utils/authenticate').loggedIn;
const multer  = require('multer');
const format = require('../utils/format');

const dashboardLayoutData = {
  layout: 'layouts/dashboard'
};

const listingLayoutData = {
  layout: 'layouts/listing'
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

router.get('/myListings', auth, function(req,res){
  Property
    .find({
      $and : [
        { isActive : true },
        { userId : req.session.userId }
      ]
    })
    .sort('-dateAdded')
    .exec(function (err, docs) {
      console.log(docs);
      if(err){
        res.json({success : false, msg : 'Failed to list!'});
      } else {
        const data = Object.assign(dashboardLayoutData, {
              title:  'Property - My listings',
              property:docs,
              format
            });
          res.render('property/myListings', data);
      }
    });
});

router.get('/listings', function(req,res){
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
        const data = Object.assign(listingLayoutData, {
              title:  'Property - My listings',
              property:docs,
              format,
              count : docs.length
            });
          res.render('property/listings', data);
      }
    });
});

router.get('/add-to-favorites/:id', (req, res) => {
  console.log('===================');
  Property.findOne({ _id: req.params.id }).exec((err, doc) => {
    const index = doc.favoritedBy.indexOf(req.session.userId);
    console.log('index', index);
    if( index > -1) {
      doc.favoritedBy.splice(index, 1);
    } else {
      doc.favoritedBy.push(req.session.userId);
    }
    doc.save((err) => {
      if(!err) {
        res.redirect(req.query.redirect_url || 'back');
      } else {
        res.json({
          success: false,
          err
        });
      }
    });
  });
});

router.get('/remove-from-favorites/:id', auth, (req, res) => {
  console.log("DELETE");
  Property.findOne({ _id: req.params.id }).exec((err, doc) => {
    const index = doc.favoritedBy.indexOf(req.session.userId);
    if( index > -1) {
      // doc.archivedBy.push(req.session.userId);
      doc.favoritedBy.splice(index, 1);
    }
    doc.save((err) => {
      if(!err) {
        res.redirect('back');
      } else {
        res.json({
          success: false,
          err
        });
      }
    });
  });
});

router.get('/view/:id', (req, res) => {
  Property.findById(req.params.id)
  .populate('userId')
  .exec((err, doc) => {
    // console.log(doc.favoritedBy);
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
          agent,
          format
        });
      });
    });
  });
});

router.get('/edit/:id', (req, res) => {
  Property.findById(req.params.id)
  .populate('userId')
    .exec(function(err, doc) {
      Users.findOne({ userId: doc.userId._id }).exec((err, agent) => {
        const images = [doc.featuredImgUrl].concat(doc.images.filter(i => i.length));
        const data = Object.assign(dashboardLayoutData, {
                data: doc,
                title: 'Property Edit',
                images,
                agent
            });
          res.render('property/edit', data);
      });
    });
});

router.post('/save', (req, res) => {
  Membership
  .findOne({ userId : req.session.userId })
  .populate('userId')
  .exec(function(err,member){
    if(err) throw err
    console.log(member.addedListings);
    if(member.memberType === 'basic' && member.addedListings >= member.allowedListings ) {
        req.flash('error', 'Please upgrade your membership plan to add more listings!');
        res.redirect('/property/add');
    } else if(member.memberType === 'silver' && member.addedListings >= member.allowedListings) {
      req.flash('error', 'Please upgrade your membership plan to add more listings!');
      res.redirect('/property/add');
    } else if(member.memberType === 'gold' && member.addedListings >= member.allowedListings){
      req.flash('error', 'Please upgrade your membership plan to add more listings!');
      res.redirect('/property/add');
    } else {
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
          console.log(member.addedListings + 1);
          Membership.update({userId : req.session.userId }, {$set: { addedListings: member.addedListings + 1 }});
          Membership.findOneAndUpdate({ userId : req.session.userId }, {$set: { addedListings: member.addedListings + 1 }}, { new: true }, function(err, doc){
            console.log(doc);
          });
          req.flash('success', 'SUCCESS! Property listing added successfully!');
          res.redirect('/property/add');
        }
      });
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
  console.log(req.params.id);
    Property.findById(req.params.id, function(err, doc) {
        if (err) throw err;
        doc.remove(function(err) {
            if (err) throw err;
             req.flash('success', 'SUCCESS! Property deleted successfully!');
             res.redirect('/property/myListings');
            // res.json({success:true,msg:'Post deleted successfully'});
        });
    });
});

module.exports = router;
