// defines passport local-signup strategy
var LocalStrategy = require("passport-local").Strategy;
var User          = require("../models/user");

module.exports = function(passport) {

  passport.use('local-signup', new LocalStrategy({
    usernameField: "email",
    passwordField: "password",
    passReqToCallback: true,
  }, function(req, email, password, done) {

    // Find a user with this email
    User.findOne({ 'local.email' : email }, function(err, user) {
      // Show error message if there is an error
      if (err) return done(err, false, { message: "Something went wrong." });

      // Show error message if a user already exists with this email 
      if (user) return done(null, false, { message: "Please choose another email." });

      //instantiate new User with the following variables, and encrypt the password using static function defined in user model
      var newUser            = new User();
      newUser.local.email    = email;
      newUser.local.username = req.body.username;
      newUser.local.fullname = req.body.fullname;
      newUser.local.image    = req.body.image;
      newUser.local.password = User.encrypt(password);

      // save new useruser
      newUser.save(function(err, user) {
        // Display error
        if (err) return done(err, false, { message: "Something went wrong." });
        
        // New user created
        return done(null, user);
      });
    });
  }));
  
}