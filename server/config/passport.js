var LocalStrategy = require('passport-local').Strategy;
var FacebookStrategy = require('passport-facebook').Strategy;
var TwitterStrategy  = require('passport-twitter').Strategy;
var GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;

var mongoose = require('mongoose');
var User = mongoose.model("User");
var configAuth = require('./auth');

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

  // LOCAL - REGISTER ----------------------------------
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
            }); // end of save
          } // end of else
        }); // end of User.findOne    
      }); // end of process.nextTick
    } // end of anon function
  )); // end of local-register

  // LOCAL - LOGIN ---------------------------------------
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

  // FACEBOOK ------------------------------------------
  passport.use(new FacebookStrategy({
      // pull in our app id and secret from our auth.js file
      clientID        : configAuth.facebookAuth.clientID,
      clientSecret    : configAuth.facebookAuth.clientSecret,
      callbackURL     : configAuth.facebookAuth.callbackURL,
      profileFields   : ["emails", "displayName"],
      passReqToCallback : true 
    },
    // facebook will send back the token and profile
    function(req, token, refreshToken, profile, done) {
      // asynchronous
      process.nextTick(function() {
        if(!req.user){
          // find the user in the database based on their facebook id
          User.findOne({ 'facebook.id' : profile.id }, function(err, user) {
            // if there is an error, stop everything and return that
            // ie an error connecting to the database
            if (err)
                return done(err);

            // if the user is found, then log them in
            if (user) {
              // if there is a user id already but no token (user was linked at one point and then removed)
              // just add our token and profile information
              if (!user.facebook.token) {
                user.facebook.token = token;
                user.facebook.name  = profile.name.givenName + ' ' + profile.name.familyName;
                user.facebook.email = profile.emails[0].value;

                user.save(function(err) {
                  if (err)
                    throw err;
                  return done(null, user);
                });
              }
              return done(null, user); // user found, return that user
            } 
            else {
              // if there is no user found with that facebook id, create them
              var newUser = new User();
              // set all of the facebook information in our user model
              newUser.facebook.id    = profile.id;                
              newUser.facebook.token = token;                   
              newUser.facebook.name  = profile.displayName;
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
        } // end of if
        else{
          // user already exists and is logged in, we have to link accounts
          var user = req.user; // pull the user out of the session
          // update the current users facebook credentials
          user.facebook.id    = profile.id;
          user.facebook.token = token;
          user.facebook.name  = profile.displayName;
          user.facebook.email = profile.emails[0].value;
          // save the user
          user.save(function(err) {
              if (err)
                  throw err;
              return done(null, user);
          }); // end of save
        } // end of else
      }); // end of process.nextTick
    } // end of anon function
  )); // end of facebook strategy

  // TWITTER LOGIN ------------------------------
  passport.use(new TwitterStrategy({
    consumerKey     : configAuth.twitterAuth.consumerKey,
    consumerSecret  : configAuth.twitterAuth.consumerSecret,
    callbackURL     : configAuth.twitterAuth.callbackURL,
    passReqToCallback : true
    },
    function(req, token, tokenSecret, profile, done) {
      process.nextTick(function() {
        if(!req.user){
          User.findOne({ 'twitter.id' : profile.id }, function(err, user) {
            if (err)
              return done(err);
            if (user) {
              // if there is a user id already but no token (user was linked at one point and then removed)
              // just add our token and profile information
              if (!user.twitter.token) {
                user.twitter.token       = token;
                user.twitter.username    = profile.username;
                user.twitter.displayName = profile.displayName;

                user.save(function(err) {
                  if (err)
                    throw err;
                  return done(null, user);
                });
              }
              return done(null, user); // user found, return that user
            } 
            else {
              // if there is no user, create them
              var newUser = new User();
              newUser.twitter.id          = profile.id;
              newUser.twitter.token       = token;
              newUser.twitter.username    = profile.username;
              newUser.twitter.displayName = profile.displayName;

              newUser.save(function(err) {
                if (err)
                  throw err;
                return done(null, newUser);
              }); // end of save function
            } // end of else
          }); // end of User.findOne
        } // end of if
        else {
          // user already exists and is logged in, we have to link accounts
          var user = req.user; // pull the user out of the session
          // update the current users facebook credentials
          user.twitter.id          = profile.id;
          user.twitter.token       = token;
          user.twitter.username    = profile.username;
          user.twitter.displayName = profile.displayName;
          // save the user
          user.save(function(err) {
            if (err)
              throw err;
            return done(null, user);
          });
        }
      }); // end of process.nextTick
    } // end of anon function
  )); // end of twitter strategy

  // GOOGLE  LOGIN -------------------------
  passport.use(new GoogleStrategy({
    clientID        : configAuth.googleAuth.clientID,
    clientSecret    : configAuth.googleAuth.clientSecret,
    callbackURL     : configAuth.googleAuth.callbackURL,
    passReqToCallback : true
    },
    function(req, token, refreshToken, profile, done) {
      process.nextTick(function() {
        if(!req.user){
          User.findOne({ 'google.id' : profile.id }, function(err, user) {
            if (err)
              return done(err);
            if (user) {
              // if there is a user id already but no token (user was linked at one point and then removed)
              // just add our token and profile information
              if (!user.google.token) {
                user.google.token = token;
                user.google.name  = profile.displayName;
                user.google.email = profile.emails[0].value;

                user.save(function(err) {
                  if (err)
                    throw err;
                  return done(null, user);
                });
              }
              // if a user is found, log them in
              return done(null, user);
            } 
            else {
              var newUser = new User();
              newUser.google.id    = profile.id;
              newUser.google.token = token;
              newUser.google.name  = profile.displayName;
              newUser.google.email = profile.emails[0].value; // pull the first email
              newUser.save(function(err) {
                if (err)
                  throw err;
                return done(null, newUser);
              }); // end of save
            } // end of else
          }); // end of User.findOne
        } // end of if
        else {
          // user already exists and is logged in, we have to link accounts
          var user = req.user; // pull the user out of the session
          user.google.id    = profile.id;
          user.google.token = token;
          user.google.name  = profile.displayName;
          user.google.email = profile.emails[0].value; // pull the first email
          user.save(function(err) {
            if (err)
              throw err;
            return done(null, user);
          });
        }
      }); // end of process.nextTick
    } // end on anon function
  )); // end of google strategy

}; // end of module object