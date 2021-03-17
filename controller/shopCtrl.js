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


// ADD TO CART
const postAddToCart = async (req, res) => {
    // console.log( req.user)
    try{
        if (req.user) {
            const userId = req.user._id   
            const prodId = req.body.prodId
            const quantity = req.body.quantity
            const price = req.body.price

            //check to see if product exist and increase the quantity
            User.findById(userId, (err, user) => {
                console.log(user.cart)
            })



            // total price for the product
            const total = parseInt(quantity) * parseInt(price)

            

            const newItem = {
                productId : prodId,
                quantity: parseInt(quantity),
                totalPrice: parseInt(total)
            }

            User.findById( userId, (err, user) => {
            //   console.log(newItem)
            user.cart.push(newItem)
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

// GET CART
const getCart = async (req, res, next) => {
    
    try{
        // console.log(req.user)
        if (req.user){
            await User.findById(req.user._id).populate('cart.productId').exec( (err, user) => {
                // subTotal price
                let subtotal = 0;
                user.cart.forEach(el => {
                   subtotal += parseInt(el.totalPrice)
                })
                // console.log(subtotal)


                res.render('shop/cart', { 
                    title: 'Simpleton',
                    user: req.user,
                    cart: user.cart,
                    subtotal: subtotal
                 })
            });
        }else {
            res.render('shop/cart', { 
                title: 'Simpleton',
                user: req.user,
            })
    }
} catch (err) {
    console.log(err)
   }

}





module.exports = {
    getHome,
    getOneProduct,
    postAddToCart,
    getCart,
}