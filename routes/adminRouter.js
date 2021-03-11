var express = require('express');
var router = express.Router();

const adminCtrl = require('../controller/adminCtrl');

/* GET users listing. */
router.get('/', adminCtrl.getAdminIndex);

router.post('/', adminCtrl.createProducts)








router.get('/preview', adminCtrl.getPreview);


module.exports = router;
