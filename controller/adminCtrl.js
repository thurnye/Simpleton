const Products = require('../model/prodModel');
// const util = require('../util/util')
const request = require('request');
const fs = require('fs');


//GET ADMIN MAIN PAGE
const getAdminIndex = (req, res, next) => {
    res.render('admin/adIndex', { 
        title: 'Simpleton',
        editing: false
     });
};



//CREATE
const createProducts = async (req, res, next) => {

    function base64_encode(image) {
        // read binary data
        var bitmap = fs.readFileSync(image);
        // convert binary data to base64 encoded string
        return bitmap.toString('base64');
    }

    const imageUrl = base64_encode(req.files.image.file)

    

    // console.log(base64_encode(req.files.image.file))
    const options = {
        method: 'POST',
        url: 'https://api.imgur.com/3/image',
        headers: {
            Authorization: process.env.Authorization
        },
        formData: {
          image: imageUrl,
          type: 'base64'
        },
    }
    
  await  request(options, function(err, response){
        if(err) return console.log(err);
        let body = JSON.parse(response.body)
        // console.log(body)
        // console.log(body.data.link)
        const newProduct = new Products ({
            name :          req.body.itemName,
            description :   req.body.description,
            price :         req.body.price,
            ratings :       req.body.ratings,
            image:          body.data.link,
            delivery :      req.body.delivery,
            category :      req.body.category,
        })
        // console.log(newProduct)
       newProduct.save()
     res.render('admin/new',{data:body.data.link})
    })

    res.redirect('/admin/preview')
  
}


//RETRIEVE ALL THE PREVIEW
const getPreview = async (req, res) => {

   try{
   let result = await Products.find();
    // console.log(result)
    res.render('admin/preview', { 
        title: 'Simpleton',
        products: result
    
    });
   } catch (err) {
    console.log(err)
   }

}


//RETRIEVE PRODUCT DETAIL

const getOne = async (req, res) => {

    try{
        const prodId = req.params.id
        // console.log(prodId)
        const product = await Products.findById(prodId)
        // console.log(product)
        res.render('admin/product', {
            title: 'Simpleton',
            product: product,
            editing: true

        })
    }catch (err) {
        console.log(err)
    }
}


//UPDATE PRODUCT
const getUpdate = async (req,res) => {

}


module.exports = {
    getAdminIndex,
    createProducts,
    getPreview,
    getOne
}
