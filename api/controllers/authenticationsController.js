// defines functions for registration and log in
var passport = require("passport");
var User     = require('../models/user');
var secret   = require('../config/config').secret
var jwt      = require('jsonwebtoken');

function register(req, res, next) {
  var localStrategy = passport.authenticate('local-signup', function(err, user, info) {
    if (err) return res.status(500).json({ message: 'Something went wrong!' });
    if (info) return res.status(401).json({ message: info.message });
    if (!user) return res.status(401).json({ message: 'User already exists!' });

    // Issue a token to an authenticated new user, for automatic log in
    var token = jwt.sign(user, secret, { expiresIn: 60*60*24 });

    // Send back the token to the front-end to store
    return res.status(200).json({
      success: true,
      message: "Thank you for authenticating",
      token: token,
      user: user
    });
  });

  return localStrategy(req, res, next);
}


function login(req, res, next) {
  // search for user by email sent in the form and test in the callback function
  User.findOne({
    "local.email": req.body.email
  }, function(err, user) {
    //check for errors
    if (err) return res.status(500).json(err);
    //check user exists
    if (!user) return res.status(403).json({ message: 'No user found.' });
    //check password using methods function defined in user model
    if (!user.validPassword(req.body.password)) return res.status(403).json({ message: 'Authentication failed.' });

    // issue token to user if email and password are authenticated
    var token = jwt.sign(user, secret, { expiresIn: 60*60*24 });

    //return success object including the following variables
    return res.status(200).json({
      success: true,
      message: 'Welcome!',
      token: token,
      user: user
    });
  });
}

module.exports = {
  login: login,
  register: register
};
