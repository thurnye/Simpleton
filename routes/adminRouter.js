var express = require('express');
var router = express.Router();

const adminCtrl = require('../controller/adminCtrl');

/* GET users listing. */
router.get('/', adminCtrl.getAdminIndex);

router.post('/', adminCtrl.createProducts)

router.post('/createfromdb', adminCtrl.apiPopulateDb)

router.get('/preview', adminCtrl.getPreview);

router.get('/preview/product/:id', adminCtrl.getOne)

router.get('/preview/edit/:id', adminCtrl.getEdit)

router.post('/preview/edit', adminCtrl.getUpdate )

router.post('/preview/product/delete/:id', adminCtrl.deleteOne)









module.exports = router;
