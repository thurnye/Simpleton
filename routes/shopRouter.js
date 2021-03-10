var express = require('express');
var router = express.Router();
const controller = require('../controller/adminCtrl')

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('shop/index', { title: 'Simpleton' });
});

module.exports = router;
