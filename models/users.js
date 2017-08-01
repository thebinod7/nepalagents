const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const objectId = mongoose.Schema.ObjectId;
const userSchema = mongoose.Schema({
    userId : objectId,
    profilePicUrl : {
        type : String
    },
    firstName : {
        type: String,
        required : true
    },
    lastName : {
        type : String
    },
    phone : {
        type : String
    },
    email : {
        type : String
    },
    password : {
        type : String
    },
    Address : {
        type : String
    },
    bio : {
        type : String
    },
    role : {
        type : String,
        default : 'user'
    },
    isActive : {
        type : Boolean,
        default : true
    },
    dateAdded : {
        type : Date,
        default: Date.now
    }
});

const Users = module.exports = mongoose.model('Users',userSchema);

module.exports.getUserByEmail = function (email, callback) {
    const query = {email : email}
    Users.findOne(query,callback);
}

module.exports.addUser = function (newUser,callback) {
    bcrypt.genSalt(10, function(err, salt) {
        bcrypt.hash(newUser.password, salt, function(err, hash) {
            if (err) throw err;
            newUser.password = hash;
            newUser.save(callback);
        });
    });
}

module.exports.comparePassword = function (candidatePassword,hash,callback) {
    bcrypt.compare(candidatePassword,hash,function (err,isMatch) {
        if(err) throw err;
        callback(null,isMatch);
    });
}

module.exports.changePassword = function (existUser,callback) {
    bcrypt.genSalt(10, function(err, salt) {
        bcrypt.hash(existUser.newPassword, salt, function(err, hash) {
            if (err) throw err;
            existUser.newPassword = hash;
            Users.update({_id : existUser.id}, {$set: {password: existUser.newPassword}}, callback);
        });
    });
}

module.exports.resetPassword = function(existUser, cb) {
  bcrypt.genSalt(10, function(err, salt) {
    console.log(existUser.password);
      bcrypt.hash(existUser.password, salt, function(err, hash) {
          if (err) throw err;
          existUser.password = hash;
          Users.update({_id : existUser.id }, {$set: {password: existUser.password}}, cb);
      });
  });
}
