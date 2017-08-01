const express = require('express');
const router = express.Router();
const Users= require('../models/users');
const nodemailer = require('nodemailer');
const session = require('express-session');
const jwt = require('jsonwebtoken');

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
    transporter.sendMail(mailOptions,function () {
        if (error) {
            return console.log(error);
        }
        console.log('Email sent successfully!');
      //  console.log('Message %s sent: %s', info.messageId, info.response);
    })
}

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

router.get('/profile',function(req,res){
    const data = Object.assign(dashboardLayoutData, {
              title:  'Users - Profile'
              });
    res.render('users/profile', data);
});

router.get('/login',function(req,res){
  const data = {
    title : "NA - Login"
  }
  res.render('users/login', data);
});

module.exports = router;
