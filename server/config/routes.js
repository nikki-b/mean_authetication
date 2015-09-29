module.exports = function(app, passport) {

  // HOME
  app.get('/', function(req, res) {
    res.render('index.ejs'); 
  });

  // PROFILE (must be logged in)
  app.get('/profile', isLoggedIn, function(req, res) {
    res.render('profile.ejs', {
      user : req.user // get the user out of session and pass to template
    });
  });

  // LOGOUT
  app.get('/logout', function(req, res) {
    req.logout();
    res.redirect('/');
  });

  // ----------------------------------------------
  // AUTHENTICATE (connecting an existing account)
  // ----------------------------------------------

  // local -------------------------------
    // login - display form
    app.get('/login', function(req, res) {
      // render the page and pass in any flash data if it exists
      res.render('login.ejs', { message: req.flash('loginMessage') }); 
    });

    // login - process form
    app.post('/login', passport.authenticate('local-login', {
      successRedirect : '/profile',
      failureRedirect : '/login',
      failureFlash : true
    }));

    // register - display form
    app.get('/register', function(req, res) {
      res.render('register.ejs', { message: req.flash('registerMessage') });
    });

    // register - process form
    app.post('/register', passport.authenticate('local-register', {
      successRedirect : '/profile',
      failureRedirect : '/register',
      failureFlash : true
    }));

  // facebook -------------------------------
  app.get('/auth/facebook', passport.authenticate('facebook', { scope : 'email' }));
  app.get('/auth/facebook/callback',
    passport.authenticate('facebook', {
      successRedirect : '/profile',
      failureRedirect : '/'
    })
  );

  // twitter -------------------------------
  app.get('/auth/twitter', passport.authenticate('twitter'));
  app.get('/auth/twitter/callback',
    passport.authenticate('twitter', {
      successRedirect : '/profile',
      failureRedirect : '/'
    })
  );

  // google -------------------------------
  app.get('/auth/google', passport.authenticate('google', { scope : ['profile', 'email'] }));
  app.get('/auth/google/callback',
    passport.authenticate('google', {
      successRedirect : '/profile',
      failureRedirect : '/'
    })
  );

  // ----------------------------------------------
  // AUTHORIZATION (connecting an existing account)
  // ----------------------------------------------

  // local ----------------------------------
  app.get('/connect/local', function(req, res) {
    res.render('connect-local.ejs', { message: req.flash('loginMessage') });
  });
  app.post('/connect/local', 
    passport.authenticate('local-signup', {
      successRedirect : '/profile',
      failureRedirect : '/connect/local',
      failureFlash : true
    })
  );

  // facebook -------------------------------
  app.get('/connect/facebook', passport.authorize('facebook', { scope : 'email' }));
  app.get('/connect/facebook/callback',
    passport.authorize('facebook', {
        successRedirect : '/profile',
        failureRedirect : '/'
    })
  );

  // twitter --------------------------------
  app.get('/connect/twitter', passport.authorize('twitter', { scope : 'email' }));
  app.get('/connect/twitter/callback',
    passport.authorize('twitter', {
        successRedirect : '/profile',
        failureRedirect : '/'
    })
  );


  // google ---------------------------------
  app.get('/connect/google', passport.authorize('google', { scope : ['profile', 'email'] }));
  app.get('/connect/google/callback',
    passport.authorize('google', {
      successRedirect : '/profile',
      failureRedirect : '/'
    })
  );

  // ----------------------------------------------
  // UNLINK (removing part of an existing account)
  // ----------------------------------------------

  // local -----------------------------------
  app.get('/unlink/local', function(req, res) {
    var user            = req.user;
    user.local.email    = undefined;
    user.local.password = undefined;
    user.save(function(err) {
        res.redirect('/profile');
    });
  });

  // facebook -------------------------------
  app.get('/unlink/facebook', function(req, res) {
    var user            = req.user;
    user.facebook.token = undefined;
    user.save(function(err) {
        res.redirect('/profile');
    });
  });

  // twitter --------------------------------
  app.get('/unlink/twitter', function(req, res) {
    var user           = req.user;
    user.twitter.token = undefined;
    user.save(function(err) {
       res.redirect('/profile');
    });
  });

  // google ---------------------------------
  app.get('/unlink/google', function(req, res) {
    var user          = req.user;
    user.google.token = undefined;
    user.save(function(err) {
       res.redirect('/profile');
    });
  });

}; // end of routes

function isLoggedIn(req, res, next) {
    // if user is authenticated in the session, carry on 
    if (req.isAuthenticated()){
        return next();
    }
    res.redirect('/');
}