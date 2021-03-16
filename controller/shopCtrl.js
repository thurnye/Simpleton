//the shop has to have the product model 
const User = require('../model/userModel')
const Products = require('../model/prodModel')



const getHome = async (req, res, next) => {
    try{
        let result = await Products.find();
    res.render('shop/home', { 
        title: 'Simpleton',
        user: req.user,
        products: result 
    });
} catch (err) {
    console.log(err)
   }

}

const getOneProduct = async (req, res) => {

    try{
        const prodId = req.params.id
        // console.log(prodId)
        const product = await Products.findById(prodId)
        // console.log(product)
        res.render('shop/product', {
            title: 'Simpleton',
            product: product,
            user: req.user
        })
    }catch (err) {
        console.log(err)
    }

}


// ADD TO CART
const postAddToCart = async (req, res) => {
    try{
        const prodId = req.params.id
        console.log(prodId)
        const product = await Products.findById(prodId)  
        return req.user.addToCart(product)
            
        
        
    }catch (err) {
        console.log(err)
    }
}






module.exports = {
    getHome,
    getOneProduct,
    postAddToCart,
}