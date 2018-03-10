var express = require('express');
var path = require('path');
require("nodejs-dashboard");
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var sequelize = require("./db/index");
var index = require('./routes/index');
var setup = require('./routes/setup');
var login = require("./routes/login");

/** Used for Authentication */
var session = require('express-session');
var passport = require("passport");
var LocalStrategy = require('passport-local').Strategy;

var app = express();

var {Calls, Contacts} = require("./db/models");

var callXMLString = function(audio, message) {

  return `<?xml version="1.0" encoding="UTF-8"?>
  <Response>
    <Say voice="man">Hello Crazy turtle.</Say>
    <Play>https://reminderbuddy.herokuapp.com/recordings/${audio}</Play>
  </Response>`;

};


app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});


app.use("/say.xml", function (req, res) {
  var callid = req.query.callid;
  
  var data;
  Calls.findOne({where: {
    id : parseInt(callid)
  }}).then(result => {
    data = callXMLString(result.audio);
    res.set('Content-Type', 'text/xml');
	  res.send(data);	
  });
  
});

/****Authentication Setup */

app.use(session({
	secret : 'myturtle',
	resave: true,
  saveUninitialized: true
}));

app.use(passport.initialize());
app.use(passport.session());


passport.serializeUser(function(user, done) {
	console.log(arguments);
	done(null, user);
});

passport.deserializeUser(function(user, done) {
  done(null, user);
});

/*
*The below strategy is used to define the login layer  
*We are using LocalStrategy because, we have 
*/
passport.use(new LocalStrategy({
   usernameField: 'username',
   passwordField : 'password'
}, function(username, password, done) {
	if(username === "hackerearth" && password === "12345") {
		console.info('we are ok here');
		done(null, username);
	}
	else {
		done(null, false);
	}
}));

/*** Authentication Setup Ends here */


// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.get("/", requireAuth, function() {
  res.redirect("/index");
});
app.use('/index', requireAuth, index);
app.use('/login', login);
app.post('/login', passport.authenticate('local', 
          { successRedirect: '/index',failureRedirect: '/login' }));
app.use('/setup', requireAuth, setup);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

function requireAuth(req, res, next){
  // check if the user is logged in
  console.log()
  if(!req.isAuthenticated()){
    req.session.messages = "You need to login to view this page";
    return res.redirect('/login');
  }

  next();
}
module.exports = app;
