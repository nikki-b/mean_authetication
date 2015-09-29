// dependencies
var express = require('express');
var app = express();
var port = process.env.PORT || 1337;
var mongoose = require('mongoose');
var passport = require('passport');
var flash = require('connect-flash');
var morgan = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var session = require('express-session');
var configDB = require('./server/config/mongoose.js');

// configuration
require('./server/config/mongoose.js');
require('./server/config/passport')(passport);

// set up express
app.use(morgan('dev')); // logging requests
app.use(cookieParser()); // read cookies
app.use(bodyParser()); // read forms

app.set('view engine', 'ejs');

// passport setup
app.use(session({ secret: 'userauthissocool' }))
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());

require('./server/config/routes.js')(app, passport);

app.listen(port);
console.log("We are listening on port " + port + "! :)");