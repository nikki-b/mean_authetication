var LocalStrategy = require('passport-local').Strategy;
var FacebookStrategy = require('passport-facebook').Strategy;
var mongoose = require('mongoose');
var User = mongoose.model("User");
var configAuth = require('./auth');

// expose this function to our app using module.exports
module.exports = function(passport) {

  // serialize the user for the session
  passport.serializeUser(function(user, done) {
      done(null, user.id);
  });

  // deserialize the user
  passport.deserializeUser(function(id, done) {
      User.findById(id, function(err, user) {
          done(err, user);
      });
  });

  // LOCAL - REGISTER
  passport.use('local-register', new LocalStrategy({
      // by default, local strategy uses username and password,
      // we will override with email
      usernameField : 'email',
      passwordField : 'password',
      passReqToCallback : true
  },
  function(req, email, password, done) {
    // asynchronous
    // User.findOne wont fire unless data is sent back
    process.nextTick(function() {
      // find a user with matching email
      User.findOne({ 'local.email' :  email }, function(err, user) {
        // if there are any errors, return the error
        if (err)
          return done(err);
        // user already exists
        if (user) {
          return done(null, false, req.flash('registerMessage', 'That email is already taken.'));
        } 
        else { // if there is no user with that email
          // create the user
          var newUser = new User();
          // set the user's local credentials
          newUser.local.email = email;
          newUser.local.password = newUser.generateHash(password);
          // save the user
          newUser.save(function(err) {
              if (err)
                  throw err;
              return done(null, newUser);
          });
        }
      }); // end of User.findOne    
    }); // end of process.nextTick
  } // end of anon function
  )); // end of local-register

  // LOCAL - LOGIN
  passport.use('local-login', new LocalStrategy({
      // by default, local strategy uses username and password,
      // we will override with email
      usernameField : 'email',
      passwordField : 'password',
      passReqToCallback : true
    },
    function(req, email, password, done) {
      // find a user whose email is the same as the forms email
      // we are checking to see if the user trying to login already exists
      User.findOne({ 'local.email' :  email }, function(err, user) {
        // if there are any errors, return the error before anything else
        if (err)
            return done(err);
        // if no user is found, return the message
        if (!user)
            return done(null, false, req.flash('loginMessage', 'Invalid credentials.'));
        // if the user is found but the password is wrong
        if (!user.validPassword(password))
            return done(null, false, req.flash('loginMessage', 'Invalid credentials.'));
        // all is well, return successful user
        return done(null, user);
      }); // end of User.findOne
    } // end of anon function
  )) // end of local-login

  // FACEBOOK - LOGIN
  passport.use(new FacebookStrategy({
      // pull in our app id and secret from our auth.js file
      clientID        : configAuth.facebookAuth.clientID,
      clientSecret    : configAuth.facebookAuth.clientSecret,
      callbackURL     : configAuth.facebookAuth.callbackURL,
      profileFields   : ["emails", "displayName"]
    },
    // facebook will send back the token and profile
    function(token, refreshToken, profile, done) {
      // asynchronous
      process.nextTick(function() {
        // find the user in the database based on their facebook id
        User.findOne({ 'facebook.id' : profile.id }, function(err, user) {
          // if there is an error, stop everything and return that
          // ie an error connecting to the database
          if (err)
              return done(err);

          // if the user is found, then log them in
          if (user) {
              return done(null, user); // user found, return that user
          } 
          else {
            // if there is no user found with that facebook id, create them
            var newUser = new User();
            // set all of the facebook information in our user model
            newUser.facebook.id    = profile.id;                
            newUser.facebook.token = token;                   
            newUser.facebook.name  = profile.name.givenName + ' ' + profile.name.familyName;
            newUser.facebook.email = profile.emails[0].value;
            // save our user to the database
            newUser.save(function(err) {
              if (err)
                throw err;
              // if successful, return the new user
              return done(null, newUser);
            }); // end of save function
          } // end of else
        }); // end of User.findOne
      }); // end of process.nextTick
    } // end of anon function
  )); // end of facebook strategy
}; // end of module object