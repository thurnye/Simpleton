var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const multer = require('multer')
var bb = require('express-busboy');

require('./config/db');






var adminRouter = require('./routes/adminRouter');
var shopRouter = require('./routes/shopRouter');

var app = express();
bb.extend(app, {
  upload: true
});

// //multer for storing images
// const fileStorage = multer.diskStorage (
//   {
//     destination:  (req, file, cb) => {
//       cb(null, 'images');
//     },
//     filename: (req, res) =>{
//       cb ( null, file.originalname + '-' + Date.now().toISOString()) 
//     }
//   }
// )

// //accept any type of these image files
//  const fileFilter = (req, file, cb) => {
//    if (
//      file.mimetype === 'image/png' ||
//      file.mimetype === 'image/jpg' ||
//      file.mimetype === 'image/jpeg'
//    ){
//      cb(null, true)
//    }else{
//      cb(null,false)
//    }
// }

// //store the image
// app.use(
//   multer({storage: fileStorage, fileFilter: fileFilter}).single('image')
// );


// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

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
