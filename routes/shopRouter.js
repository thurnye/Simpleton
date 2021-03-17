var express = require('express');
var router = express.Router();
const shopCtrl = require('../controller/shopCtrl')
const passport = require('passport');




/* GET loader page. */
router.get('/', function(req, res, next) {
  res.render('shop/index', { title: 'Simpleton', user: req.user });
});

//Get Shop Page
router.get('/shop', shopCtrl.getHome);


//Get Product Details
 router.get('/shop/product/:id', shopCtrl.getOneProduct)


//Get Cart
router.get('/shop/cart', shopCtrl.getCart)


// Add to Cart
router.post('/shop/cart', shopCtrl.postAddToCart)



































// Google OAuth login route --login shld point to this adddress
router.get('/auth/google', passport.authenticate(
  'google',
  { scope: ['profile', 'email'] }
));

// Google OAuth callback route
//after the login, send them back to
router.get('/oauth2callback', passport.authenticate(
  'google',
  {
    successRedirect : '/shop',
    failureRedirect : '/shop'
  }
));

// OAuth logout route
router.get('/logout', function(req, res){
  req.logout();
  res.redirect('/shop');
});







module.exports = router;
