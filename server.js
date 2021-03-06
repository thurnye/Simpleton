var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const multer = require('multer')
var bb = require('express-busboy');
var passport = require('passport')
var session = require('express-session')
var methodOverride = require('method-override');

require('dotenv').config();

require('./config/db');

require('./config/passport')




var adminRouter = require('./routes/adminRouter');
var shopRouter = require('./routes/shopRouter');

var app = express();
bb.extend(app, {
  upload: true
});



// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(methodOverride('_method'));

app.use(passport.initialize())
app.use(session ({
  secret: 'SEIRocks!',
  resave: false,
  saveUninitialized: true
}))
app.use(passport.initialize());
app.use(passport.session())

app.use('/', shopRouter);
app.use('/admin', adminRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
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

module.exports = app;
