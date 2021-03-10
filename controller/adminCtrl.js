const Products = require('../model/prodModel');



//GET ADMIN MAIN PAGE
exports.getAdminIndex = (req, res, next) => {
    res.render('admin/adIndex', { title: 'Simpleton' });
};

//GET THE PREVIEW
exports.getPreview = (req, res) => {
    res.render('admin/preview', { title: 'Simpleton' });
}


