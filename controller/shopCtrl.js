//the shop has to have the product model 
const User = require('../model/userModel')
const Products = require('../model/prodModel')
const Order= require('../model/orderModel');
const { response } = require('express');
const stripe = require('stripe')('sk_test_nWJlQsKsiGouZmCC7nS92WbZ00QQCw355D');


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
                // console.log(user.cart)
                if (user.cart.length === 0){
                    // total price for the product
                    const total = parseInt(quantity) * parseInt(price)
                    const newItem = {
                        product : prodId,
                        quantity: parseInt(quantity),
                        totalPrice: parseInt(total)
                    }
                    user.cart.push(newItem)
                    user.save((err)=>{
                        if(err) { 
                            console.log(err)  
                        }else{  res.redirect('/shop/cart')
                        }
                    })
                }else{
               
                for (let i=0; i < user.cart.length; i++) {
                    console.log(console.log(i))

                    // check to see if product exist
                    if (user.cart[i].product._id.toString() === prodId.toString()) {
                        
                        let cartQuantity = user.cart[i].quantity
                        // console.log(req.body.quantity, cartQuantity)
                        updatedQuantity = parseInt(req.body.quantity) + parseInt(cartQuantity)
                        user.cart[i].quantity = updatedQuantity

                         //  // total price for the product
                         const total = parseInt(updatedQuantity) * parseInt(price)
                         user.cart[i].totalPrice = total
                        console.log(user.cart[i].quantity, user.cart[i].totalPrice)

                        user.save((err)=>{
                           err ? err : res.redirect('/shop/cart')
                            
                        })


                    }else{ //if it does not, create new one
                        console.log('not yet')
                        // total price for the product
                        const total = parseInt(quantity) * parseInt(price)
                        const newItem = {
                            product : prodId,
                            quantity: parseInt(quantity),
                            totalPrice: parseInt(total)
                        }
                        user.cart.push(newItem)
                        user.save((err)=>{
                            err ? err : res.redirect('/shop/cart')
                        })
                    }
                } 
            }
                
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
            await User.findById(req.user._id).populate('cart.product').exec( (err, user) => {
                
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
                    length: user.cart.length,
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



//remove product from the array
const removeCartItem = async (req, res) => {
    try {
        const prodId = req.body.prodId
        User.findById(req.user._id, (err, user) => {
            console.log(user.cart)
            for (let i=0; i < user.cart.length; i++) {
                if (user.cart[i].product._id.toString() === prodId.toString()) {
                    
                    user.cart[i].remove()
                    user.save((err)=>{
                        if(err) { 
                            console.log(err)  
                        }else{  res.redirect('/shop/cart')
                        }
                         
                     })
                }
            }
        })



    }catch(err) {
        console.log(err)
    }
  
  }



//   Get Checkout
const getCheckout =  (req, res) => {
    try {

        if (req.user){
            let subtotal = 0;
            let products;
             User.findById(req.user._id)
             .populate('cart.product')
             .exec() 
            .then(user => {
                // subTotal price
                products = user.cart
                subtotal = 0
                products.forEach(el => {
                   subtotal += parseInt(el.totalPrice)
                })
                // console.log(user)

                // implementing Stripe
                // here we want to return the session key
                return  stripe.checkout.sessions.create({
                    payment_method_types: ['card'],
                    line_items: products.map(el => {
                        return{
                        name: el.product.name,
                        quantity: el.quantity,
                        amount: parseInt(el.product.price) * 100,
                        images: [el.product.image],
                        currency: 'cad'
                    };
                    }),

                    mode: 'payment',
                    success_url: `${req.protocol}://${req.get('host')}/shop/cart/checkout/success`,
                    cancel_url: `${req.protocol}://${req.get('host')}/shop/cart/checkout/cancel`,
                })
            })
            .then(session => {
                // console.log("session : ", session.id) 
                res.render('shop/checkout', {
                    title: 'Simpleton',
                    user: req.user,
                    products: products, //cart items
                    length: products.length,
                    subtotal: subtotal,
                    sessionId: session.id
                })
            })
        }else {
            res.redirect('/auth/google')
        }



    }catch(err) {
        console.log(err)
    }
}





module.exports = {
    getHome,
    getOneProduct,
    postAddToCart,
    getCart,
    removeCartItem,
    getCheckout,
}