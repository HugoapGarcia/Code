// Imports external dependencies
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const express = require('express');
const _ = require('underscore');
const path = require('path');
mongoose.Promise = global.Promise;

// Ip : 192.168.151.123  //"ws": "^1.1.1"
var app = express();

const key   = 'q23jr983fh94hHJ8&'


// User model
var UserSchema = new mongoose.Schema({
  username: { type: String, lowercase: true, unique: true },
  hash: String,
  salt: String,
  email:      {type: String, lowercase: true},
  firstName:  {type: String, lowercase: true},
  lastName:   {type: String, lowercase: true},
  title:      {type: String, lowercase: true},
  profileImage: {type: String, lowercase: true},
  connectionId: {type: String},
  active: {type: Boolean, default: false },
  contacts: [],
  createdAt : { type: Date, default: Date.now},
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

UserSchema.methods.generateJWT = function() {
  // set expiration to 60 days
  var today = new Date();
  var exp = new Date(today);
  exp.setDate(today.getDate() + 60);

  return jwt.sign({
    _id: this._id,
    username: this.username,
    token: true,
    exp: parseInt(exp.getTime() / 1000),
  }, 'SECRET');
};

mongoose.model('User', UserSchema);

// Passport
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var User = mongoose.model('User');

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

app.use(passport.initialize());

// Router
// var crud = require('../_utils/crud');
// var router = crud.routesUtil.router;

// Sing up function
router.post('/user/*', function(req, res, next) {
  next();
});

router.post('/metrics/*', function(req, res, next) {
  if(req.key != key)
    res.end('incorrect key');
  else
    next();
}, function(req, res, next){
  // TODO : do for each for array users and save to mongo.
});

router.all('/contactList/*', function(req, res, next) {
  next();
});

router.post('/signup', function(req, res, next){
  if(!req.body.action.username || !req.body.action.password){
    return res.json({message: 'Please fill out all fields'});
  }
  var currentTime = new Date();
  var Stam = currentTime.getTime();
  var user = new User();

  user.username = req.body.action.username;

  user.setPassword(req.body.action.password);

  user.save(function (err){
    if(err){ return res.json({Error : err}); }

    return res.json({
        _id: user._id,
        username: user.username,
        contacts: user.contacts
    });
  });

});

// Sign in function
router.post('/signin', function(req, res, next){
  if(!req.body.username && !req.body.password) {
    return res.json({invalid: 'missing username/password'});
  }

  if(!req.body.username) {
    return res.json({invalid: 'missing username'});
  }

  if(!req.body.password) {
    return res.json({invalid: 'missing password'});
  }

  passport.authenticate('local', function(err, user, info){
    if(err){ return next(err); }

    if(user) {
    //   return res.json({token: user.generateJWT()});
      var resUser = {
          _id: user._id,
          username: user.username,
          contacts : user.contacts
      }

      if (!user) { resUser.invalid = 'not an user in data base'; }

      return res.json(resUser);
    } else {
      return res.json({invalid: 'invalid username or password'});
    }
  })(req, res, next);
});

// Get User and Set parms
router.get('/users', function(req, res, next){

    User.find().exec(function(err, elements){
        if(err){ console.log(err); }

        _.each(elements, function(element){
            element.hash = null;
            element.salt = null;
        });

        res.json(elements);
    });
});


router.param('user', function(req, res, next, id) {
    User.findById(id).exec(function (err, element) {
      if (err) { console.log(err); }

      req.element = element;
      return next();
    });
});

// Updating existing user if is that case
router.put('/users/:user', function(req, res) {
    var element = req.element;
    var password = req.body.credentials.password;

    if (password != null && password != '') {
        element.setPassword(password);
    }


    element = _.extend(element, req.body);

    element.save(function(err, element) {
        if(err){ console.log(err); }

        res.json(element);
    });
});


router.get('/', function(req, res, next){
   res.sendFile(path.join(__dirname, './public', 'index.html'));
});


module.exports = router;
