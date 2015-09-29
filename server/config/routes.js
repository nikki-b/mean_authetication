// app/routes.js
module.exports = function(app, passport) {

    // HOME
    app.get('/', function(req, res) {
        res.render('index.ejs'); 
    });

    // LOGIN - display form
    app.get('/login', function(req, res) {
        // render the page and pass in any flash data if it exists
        res.render('login.ejs', { message: req.flash('loginMessage') }); 
    });

    // LOGIN - process form
    app.post('/login', passport.authenticate('local-login', {
        successRedirect : '/profile', // success
        failureRedirect : '/login', // error
        failureFlash : true // allow flash messages
    }));

    // REGISTER - display form
    app.get('/register', function(req, res) {
        // render the page and pass in any flash data if it exists
        res.render('register.ejs', { message: req.flash('registerMessage') });
    });

    // REGISTER - process form
    app.post('/register', passport.authenticate('local-register', {
        successRedirect : '/profile', // success
        failureRedirect : '/register', // error
        failureFlash : true // allow flash messages
    }));

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

    // FACEBOOK
    app.get('/auth/facebook', passport.authenticate('facebook', { scope : 'email' }));
    // handle the callback after facebook has authenticated the user
    app.get('/auth/facebook/callback',
        passport.authenticate('facebook', {
            successRedirect : '/profile',
            failureRedirect : '/'
        })
    );

};

// route middleware to make sure a user is logged in
function isLoggedIn(req, res, next) {
    // if user is authenticated in the session, carry on 
    if (req.isAuthenticated())
        return next();
    // if they aren't redirect them to the home page
    res.redirect('/');
}