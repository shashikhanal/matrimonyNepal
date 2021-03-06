var express = require('express');
var app = express();
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var session = require('express-session');
var mongoose = require('mongoose');
var passport = require('passport');
var flash = require('connect-flash');
var MongoStore = require('connect-mongo')(session);

var configDB = require('./config/database.js');
mongoose.connect(configDB.mongoURI[app.settings.env], function(err, res){
  if (err) {
    console.log('Error connecting to the database. ' + err);
  } else {
    console.log('Connected to Database: ' + configDB.mongoURI[app.settings.env]);
  }
});

require('./config/passport')(passport);

// var routes = require('./routes/index');
// var users = require('./routes/users');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, '/public/images/marriage.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'uploads')));


app.use(session({ secret: 'thisIsTheSecretString!@#xx',
                saveUninitialized: true,
                resave: true,
                store: new MongoStore({mongooseConnection: mongoose.connection,
                  ttl: 3 * 24 * 60 * 60})
                }));
app.use(passport.initialize());
app.use(passport.session());//persistent login session
app.use(flash());// use connect-flash for flash messages stored in session

// app.use('/', routes)(passport);
// app.use('/users', users);
require('./routes/index.js')(app, passport);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});


module.exports = app;
