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
            season :        req.body.season,
            feature :       req.body.feature,
        })
        console.log(newProduct)
       newProduct.save()
       res.redirect('/admin/preview')
    //  res.render('admin/new',{data:body.data.link})
    })

  
}


//RETRIEVE ALL THE PREVIEW
const getPreview = async (req, res) => {

   try{
   let result = await Products.find();
   const newArrival = await Products.find({feature: 'New Arrival'})
   const bestSeller = await Products.find({feature: 'Best Seller'})
   const featuring = await Products.find({feature: 'Featuring'})
   const specialOffer = await Products.find({feature: 'Special Offer'})



   console.log('Special Offer :', specialOffer )

    // console.log(result)
    res.render('admin/preview', { 
        title: 'Simpleton',
        products: result,
        newArrival: newArrival,
        bestSeller: bestSeller,
        featuring : featuring,
        specialOffer: specialOffer 
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
}
