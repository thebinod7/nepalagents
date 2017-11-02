const express = require('express');
const router = express.Router();
const Users= require('../models/users');
const Membership= require('../models/membership');
const nodemailer = require('nodemailer');
const session = require('express-session');
const jwt = require('jsonwebtoken');
const auth = require('../utils/authenticate').auth;
const loggedIn = require('../utils/authenticate').loggedIn;
const multer  = require('multer');
const Property= require('../models/property');
const format = require('../utils/format');

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

const dashboardLayoutData = {
  layout: 'layouts/dashboard'
};

var sendEmail = function (dest,name,uniqueId,purpose) {
  var content,sub;
  if(purpose === 'signup') {
    sub = 'User registration ✔';
    content = '<b>Congratulations '+ name +', you have been registered to Nepal Agents.</b><br><a href="http://localhost:2000">Click here to continue!</a>' // html body
  } else if(purpose === 'forgotPass') {
    sub = 'Forgot Password Recovery ✔';
    content = '<b>Hi '+ name +', you have made a request to recover password.</b><br><a href="http://localhost:2000/users/forgot/'+ uniqueId +'">Click here to reset your password</a>' // html body
  }
  else {
    sub = 'Check Email✔';
    content === 'No purpose sent!'
  }
    // create reusable transporter object using the default SMTP transport
    var transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: 'binod@rumsan.com',
            pass: 'T$mp1234'
        }
    });

// setup email data with unicode symbols
    var mailOptions = {
        from: 'binod@rumsan.com', // sender address
        to: dest, // list of receivers
        subject: sub, // Subject line
       // text: message, // plain text body
        html: content
    };

    // send mail with defined transport object
    transporter.sendMail(mailOptions,function (eror) {
        if (error) {
            return console.log(error);
        }
        console.log('Email sent successfully!');
      //  console.log('Message %s sent: %s', info.messageId, info.response);
    })
}

router.post('/update/:id', upload.single('profilePicUrl'), function (req,res) {
      const profilePicUrl = req.file ? req.file.filename : req.body.profilePicUrl;
      const payload = Object.assign({}, req.body, {
        profilePicUrl
      });
      Users.findOneAndUpdate({ _id: req.params.id }, { $set: payload }, (err) => {
        if(err) {
          req.flash('error', 'ERROR! Failed to update profile');
          res.redirect('/users/profile');
        }
        req.flash('success', 'SUCCESS! Profile updated successfully!');
        res.redirect('/users/profile');
      });
});


router.post('/signup',function (req,res) {
    const payload = Object.assign({}, req.body, {
    });
    const newUser = new Users(payload);
    Users.getUserByEmail(newUser.email,function (err,userEmail) {
        if(err) throw err;
        if(userEmail){
          req.flash('error', 'Email already exits. Try new one or goto login!');
          res.redirect('/users/signup');
          return;
        }
        else {
            Users.addUser(newUser,function (err,doc) {
                if(err){
                  req.flash('error', 'Server error! Please try again');
                  res.redirect('/users/signup');
                } else {
                    if(req.body.role === 'agent'){
                      const memberPayload =  { userId : doc._id };
                      const membership = new Membership(memberPayload);
                      membership.save((err) => {
                        if(err) {
                          console.log(err);
                        } else {
                          console.log('Basic user added');
                        }
                      });
                    }
                    sendEmail(doc.email,doc.firstName,doc._id,'signup');
                    req.flash('success', 'Congratulations, Your account has been created successfully.');
                    res.redirect('/users/login');
                }
            })
        }
    });
});

router.post('/login',function (req,res) {
    var users = new Users({
        email : req.body.email,
        password : req.body.password
    });
    Users.getUserByEmail(users.email, function (err, doc) {
        if(err) throw err;
        if(!doc){
            req.flash('error', 'Email not registered!');
            res.redirect('/users/login');
            return;
        }
        Users.comparePassword(users.password,doc.password,function (err,isMatch) {
            if(err) throw err;
            if(isMatch){
              req.session.userId = doc._id;
              req.session.user = doc;
              req.session.loggedIn = true;
              res.redirect('/users/profile');
            }
            else {
              req.flash('error', 'Wrong email or password!');
              res.redirect('/users/login');
            }
        });
    });
});

router.get('/signup',function(req,res){
  const data = {
    title : "NA - Signup"
  }
  res.render('users/signup', data);
});

router.get('/settings', auth,function(req,res){
  const data = Object.assign(dashboardLayoutData, {
        title:  'Users - Settings'
      });
    res.render('users/settings', data);
});

router.get('/favorite',auth,function(req,res){
    Property.find({ favoritedBy: req.session.userId }).exec((err, docs) => {
    const data = {
      layout: 'layouts/dashboard',
      title:  'Favorite Properties',
      docs,
      format
    };
    res.render('users/favoriteProperty', data);
  });
});

router.post('/change/password',(req,res) => {
    const existUser = {
         password : req.body.password,
         newPassword : req.body.newPassword,
         id : req.session.userId
    }
    Users.findById({_id : existUser.id},function (err,isUser) {
        if(err) throw err;
        if(isUser){
            Users.comparePassword(existUser.password,isUser.password,function (err,isMatch) {
                console.log('Match:' + isMatch);
                if(err) throw err;
                if(isMatch){
                    Users.changePassword(existUser,function (err,doc) {
                        if(err){
                            res.json({success : false, msg : 'Error occured,try again!'});
                        } else {
                          req.flash('success', 'SUCCESS, Password has been updated successfully please login');
                          res.redirect('/users/logout');
                        }
                    })
                }
                else {
                  req.flash('error', 'ERROR, Wrong old password!');
                  res.redirect('/users/settings');
                }
            });
        } else {
          req.flash('error', 'Oops! Something went wrong. Please try again.');
          res.redirect('/users/account');
        }
    })
});

router.get('/forgot/:id',function (req,res) {
    data = {
        title: 'Users - Reset Password'
    },
        res.render('users/resetPassword',data);
});

router.post('/forgot/password', (req,res) => {
  Users.findOne({'email' : req.body.email}, function(err,user) {
      console.log(user);
      if(!user){
        req.flash('error', 'ERROR! Your email is not registered to our system!');
        res.redirect('/users/login');
      } else {
        sendEmail(req.body.email,user.firstName,user._id,'forgotPass');
        req.flash('success', 'SUCCESS! Please check your email to reset password!');
        res.redirect('/users/login');
      }
    });
});

router.post('/reset/password', (req,res) => {
  const existUser = {
       id : req.body.userId,
       password : req.body.password
  }
  Users.findOne({'_id' : existUser.id}, function(err,user) {
    if(!user){
      req.flash('error', 'ERROR! Your account is not registered in our system.');
      res.redirect('/users/login');
    } else {
          Users.resetPassword(existUser,function (err,doc) {
          if(err){
            res.json({success : false, msg : 'Error occured,try again!'});
          } else {
            req.flash('success', 'SUCCESS! Your password has been reset successfully, please login.');
            res.redirect('/users/login');
          }
      })
    }
  });
});

router.get('/profile',auth, function(req,res){
      Users.findById(req.session.userId, function(err, doc) {
      if(err){
          res.json({success : false, msg : 'User not found!'});
      } else {
        const data = Object.assign(dashboardLayoutData, {
              title:  'Users - Profile',
              user: doc
            });
            res.render('users/profile', data);
      }
    });
});

router.get('/login',function(req,res){
  const data = {
    title : "NA - Login"
  }
  res.render('users/login', data);
});

router.get('/logout', (req, res) => {
  req.session.userId = null;
  req.session.loggedIn = false;
  req.session.user = null;
  res.redirect('/users/login');
});


module.exports = router;
