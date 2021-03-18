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

    // const id = req.body.delArrival
    // const parent = req.body.parent
    // Flight.findById(parent)
    // .then(flight => {
    //   flight.destinations.id(id).remove()
    //   flight.save()
    //   res.redirect(`/single-flight/${flight._id}`)
    // })
    // .catch(err => {
    //   console.log(err)
    // })
  
  }


module.exports = {
    getHome,
    getOneProduct,
    postAddToCart,
    getCart,
    removeCartItem,
}