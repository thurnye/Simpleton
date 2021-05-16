const Products = require('../model/prodModel');
// const util = require('../util/util')
const request = require('request');
const fs = require('fs');
const axios = require("axios").default;
const { Console } = require('console');

var options = {
    method: 'GET',
    url: 'https://v1-sneakers.p.rapidapi.com/v1/sneakers',
    params: {limit: '100', brand: 'adidas'},
    headers: {
      'x-rapidapi-key': process.env.RAPID_API_KEY,
      'x-rapidapi-host': process.env.RAPID_HOST
    }
  };



//GET ADMIN MAIN PAGE
const getAdminIndex = (req, res, next) => {
    res.render('admin/adIndex', { 
        title: 'Simpleton',
        editing: false
     });
};

// API Populate DB
const apiPopulateDb = async (req, res, next) => {
    axios.request(options).then(function (response) {
        let data = response.data.results
            console.log(data)
       
        for(let i = 0; i < data.length; i++){
            const newProduct = new Products ({
                name :          data[i].name,
                brand:          data[i].brand,
                colorway :      data[i].colorway,
                gender :        data[i].gender,
                releaseDate:    data[i].releaseDate,
                retailPrice :   data[i].retailPrice,
                shoe :          data[i].shoe,
                styleId:        data[i].styleId,
                title:          data[i].title,
                year:           data[i].year,
                media: {
                    imageUrl: data[i].media.imageUrl,
                    smallImageUrl: data[i].media.smallImageUrl,
                    thumbUrl: data[i].media.thumbUrl,
                },
            })
            newProduct.save()
        }
        res.redirect('/admin/preview')
    }).catch(function (error) {
        console.error(error);
    });
}


//CREATE   MANUALLY FORM FORM
const createProducts = async (req, res, next) => {

    function base64_encode(image) {
        // read binary data
        var bitmap = fs.readFileSync(image);
        // convert binary data to base64 encoded string
        return bitmap.toString('base64');
    }

    const imageUrl = base64_encode(req.files.image.file)

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
        const newProduct = new Products ({
            name :          req.body.name,
            brand:          req.body.brand,
            colorway :      req.body.colorway,
            gender :        req.body.gender,
            releaseDate:    req.body.releaseDate,
            retailPrice :   req.body.retailPrice,
            shoe :          req.body.shoe,
            styleId:        req.body.styleId,
            title:          req.body.title,
            year:           req.body.year,
            media: {
                imageUrl: body.data.link,
                smallImageUrl: body.data.link,
                thumbUrl: body.data.link,
            },
        })
       newProduct.save()
       res.redirect('/admin/preview')
    })  
}


//RETRIEVE ALL THE PREVIEW
const getPreview = async (req, res) => {
   try{
//    let result = await Products.find();
//     res.render('admin/preview', { 
//         title: 'Simpleton',
//         products: result,
//     });

    // pagination
    const page = req.params.page || 1
    const perPage = 20;
    // const startIndex = (page - 1) * limit
    // const endIndex = page * limit


    await Products.find()
    .find({})
    .skip((perPage * page) - perPage)
    .limit(perPage)
    .exec((err, products) => {
        Products.count().exec((err, count) => {
            if (err) return next(err)
            // console.log(products)
            res.render('admin/preview', {
                title: 'Simpleton',
                user: req.user,
                products: products,
                current: page,
                pages: Math.ceil(count / perPage)
            })
        })
    })
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
        })
    }catch (err) {
        console.log(err)
    }
}


//Edit PRODUCT
const getEdit = async (req,res) => {
    try{
        const prodId = req.params.id
        // console.log(prodId)
        const product = await Products.findById(prodId)
        // console.log(product)
        res.render('admin/edit', {
            title: 'Simpleton',
            product: product,
            editing: true

        })
    }catch (err) {
        console.log(err)
    }
}


//UPDATE Product
const getUpdate = async (req, res) => {
    try{
        const prodId = req.body.prodId
        console.log(prodId)
        const product = await Products.findById(prodId)

        //check for the chedkbox
        if(req.body.check) {
            //change image
            function base64_encode(image) {
                var bitmap = fs.readFileSync(image);
                return bitmap.toString('base64');
            }
            const imageUrl = base64_encode(req.files.image.file)

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

            //do the update here
            request(options, function(err, response){

                if(err) return console.log(err);
                let body = JSON.parse(response.body)

                    product.name =          req.body.itemName,
                    product.description =   req.body.description,
                    product.price =         req.body.price,
                    product.ratings =       req.body.ratings,
                    product.image=          body.data.link,
                    product.delivery =      req.body.delivery,
                    product.category =      req.body.category,
                
                // console.log(newProduct)
            product.save()
            res.redirect('/admin/preview')

            // res.render('admin/new',{data:body.data.link})
            })
        } else{
            // console.log("don't change") 
            const image = product.image
            product.name =          req.body.itemName,
            product.description =   req.body.description,
            product.price =         req.body.price,
            product.ratings =       req.body.ratings,
            product.image=          image,
            product.delivery =      req.body.delivery,
            product.category =      req.body.category,
        
                // console.log(newProduct)
            product.save()
            res.redirect('/admin/preview')
        }
    }catch (err){
        console.log(err)
    }
}


// DELETE PRODUCT
const deleteOne = async (req, res) => {
try {const prodId = req.params.id
  console.log(prodId)
 await Products.findByIdAndDelete(prodId)
 res.redirect('/admin/preview')
} catch(err){
    console.log(err)
}
}







module.exports = {
    getAdminIndex,
    createProducts,
    getPreview,
    getOne, 
    getEdit,
    getUpdate,
    deleteOne,
    apiPopulateDb
}
