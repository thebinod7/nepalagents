const express = require('express');
const router = express.Router();
const Users= require('../models/users');
const nodemailer = require('nodemailer');
const session = require('express-session');
const jwt = require('jsonwebtoken');
const auth = require('../utils/authenticate').auth;
const loggedIn = require('../utils/authenticate').loggedIn;
const multer  = require('multer');

const dashboardLayoutData = {
  layout: 'layouts/dashboard'
};

router.get('/add',function(req,res){
  const data = Object.assign(dashboardLayoutData, {
        title:  'Property - Add'
      });
    res.render('property/add', data);
});

module.exports = router;
