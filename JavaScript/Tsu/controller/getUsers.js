// Imports external dependencies
const mongoose  = require('mongoose');
const jwt       = require('jsonwebtoken');
const crypto    = require('crypto');
const express   = require('express');
const _         = require('underscore');
mongoose.Promise = global.Promise;

var app = express();

// USER MODEL
var UserSchema = new mongoose.Schema({
  username: { type: String, lowercase: true, unique: true },
  hash: String,
  salt: String,
  email:      {type: String, lowercase: true},
  firstName:  {type: String, lowercase: true}, 
  lastName:   {type: String, lowercase: true},
  title:      {type: String, lowercase: true, default: null},
  profileImage: {type: String, lowercase: true},
  connectionId: {type: String},
  connected:   {type: Boolean, default: false },
  device :  {type: Number},
  contacts: [],
  createdAt :    { type: Date, default: Date.now},
  modifiedDate : { type: Date, default: Date.now},
});


// Creating salt and hash base on password typed
UserSchema.methods.setPassword = function(password){
  this.salt = crypto.randomBytes(16).toString('hex');

  this.hash = crypto.pbkdf2Sync(password, this.salt, 1000, 64, 'sha1').toString('hex');
};

UserSchema.methods.validPassword = function(password) {
    if (!this.salt) { return false; }

    var hash = crypto.pbkdf2Sync(password, this.salt, 1000, 64, 'sha1').toString('hex');
    return this.hash === hash;
};



mongoose.model('User', UserSchema);

// Passport
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var User = mongoose.model('User');

var Authenticate = function(username, password){

  User.findOne({username: username}, function(err, user){
    if(err){return (err)}
    if(!user){
      console.log('Incorrect username')
      return ({ message: 'Incorrect username.' })
    }

    this.salt = crypto.randomBytes(16).toString('hex');

    this.hash = crypto.pbkdf2Sync(password, this.salt, 1000, 64, 'sha1').toString('hex');

    console.log('fail')

  });
}



passport.use(new LocalStrategy(
  function(username, password, done) {
    User.findOne({ username: username }, function (err, user) {
      if (err) { return done(err); }
      if (!user) {
        return done(null, false, { message: 'Incorrect username.' });
      }
      if (!user.validPassword(password)) {
        return done(null, false, { message: 'Incorrect password.' });
      }
      return done(null, user);
    });
  }
));

passport.deserializeUser(function(id, done) {
  User.findById(id, function (err, user) {
    done(err, user);
  });
});

app.use(passport.initialize());


// GLOBAL CALL TO MONGO DB CONNECTION
var crud = require('../_utils/crud');


module.exports = {
    // USER SIGNUP
    setUserSignUp: function(data) {
         var response;

      if(!data.username || !data.password){
        return ({message: 'Please fill out all fields username/password'});
      }
      if(!data.firstName || !data.lastName){
        return ({message: 'Please fill out fields first Name/last Name'});
      }
      // Remember check for title and image future..

      var user = new User();

      user.createdAt = data.date;

      user.username =  data.username;

      user.setPassword(data.password);

      user.firstName = data.firstName;

      user.lastName = data.lastName;

      user.connectionId = data.connectionId;

      user.save(function (err){
        if(err){ console.log(err.message); return}

        let success = {
          _id: user._id,
          username: user.username,
          contacts: user.contacts,
          connectionId: user.connectionId,
          connected: true
        }
      //  console.log (success);
        //return success;
      });
      console.log('test: ', user);
      if(user._id) {
        console.log('user created.');
        return {created: 'success'};
      }

    },

    // NEW USER SIGNIN
    getUserSignIn : function(user){
      //User.find({}, function(err, data) { console.log(err, data, data.length);});
      if(!user.username && !user.password) {
        return ({invalid: 'missing username/password'});
      }

      if(!user.username) {
        return ({invalid: 'missing username'});
      }

      if(!user.password) {
        return ({invalid: 'missing password'});
      }

       var validUser = Authenticate(user.username, user.password)
      console.log(validUser)
    },

    updatedUserCredeantials: function(){
      console.log('This is updating any user info function..')
    },

    getUserInformationByConnecitonId: function(){
      console.log('This is get general user info function..')
    },

    getUserCoonectionId: function(){
      console.log('This is get user status Connection function..')
    },

    deleteUserFromDataBase: function(){
      console.log('Delete user function..')
    }



};
