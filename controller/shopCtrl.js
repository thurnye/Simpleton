//the shop has to have the product model 
const User = require('../model/userModel')
const Products = require('../model/prodModel')
const Order= require('../model/orderModel');
const { response } = require('express');



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


// GET CART
const getCart = async (req, res, next) => {
    console.log(req.user)
    try{
    res.render('shop/cart', { 
        title: 'Simpleton',
        user: req.user,
    });
} catch (err) {
    console.log(err)
   }

}





// ADD TO CART
const postAddToCart = async (req, res) => {
    // console.log( req.user)
    try{
        if (req.user) {
            const user = req.user._id   
            const prodId = req.body.prodId
            const quantity = req.body.quantity

          User.findById({ _id: user }, (err, user) => {
              console.log(user)
            user.cart.push({
                    product: prodId,
                    quantity: quantity,
                })
            user.save((err)=>{
                console.log(err)
                res.redirect('/shop/cart')
            })
         }) 
        }else{
            //if no user redirect to login
            res.redirect('/auth/google')
        } 
    }catch (err) {
        console.log(err)
    }
}






module.exports = {
    getHome,
    getOneProduct,
    postAddToCart,
    getCart,
}