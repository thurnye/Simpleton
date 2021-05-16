//the shop has to have the product model 
const User = require('../model/userModel')
const Products = require('../model/prodModel')
const Order= require('../model/orderModel');
const { response } = require('express');
const stripe = require('stripe')('sk_test_nWJlQsKsiGouZmCC7nS92WbZ00QQCw355D');
const nodemailer = require('nodemailer')
const sendgridTransport = require('nodemailer-sendgrid-transport');
const fs = require("fs");
const PDFDocument = require("pdfkit");


const getHome = async (req, res, next) => {
    try{
    res.render('shop/home', { 
        title: 'Simpleton',
        user: req.user, 
    });
} catch (err) {
    console.log(err)
   }

}

// Get Catalog
const getCatalog = async (req, res, next) => {
    try{
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
                res.render('shop/catalog', {
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

// Single Product
const getOneProduct = async (req, res) => {

    try{
        const prodId = req.params.id
        // console.log(prodId)
        const product = await Products.findById(prodId)
        console.log(product)
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
            // console.log(userId)
            // console.log(prodId)
            // console.log(quantity)
            // console.log(price)
            //check to see if product exist and increase the quantity
            User.findById(userId, (err, user) => {
                // console.log(user.cart)
                let foundProd;
                if (user.cart.length === 0){
                    // total price for the product
                    // console.log(quantity)
                    const total = parseInt(quantity) * parseInt(price)
                    const newItem = {
                        product : prodId,
                        quantity: parseInt(quantity),
                        totalPrice: parseInt(total)
                    }
                    user.cart.push(newItem)
                    return user.save((err)=>{
                        if(err) { 
                            console.log(err)  
                        }else{  res.redirect('/shop/cart')
                        }
                    })
                }


                //  if product exist
                for (let i=0; i < user.cart.length; i++) {
                    // console.log(console.log(i))
                    if (user.cart[i].product._id.toString() === prodId.toString()) {
                        // console.log('found at position',user.cart[i])
                        foundProd = user.cart[i];
                    }
                } 

                //if it does not, create new one
                if(!foundProd){ 
                    // console.log('create a new product')
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

                // if found
                if(foundProd){
                    // console.log(foundProd)
                    let cartQuantity = foundProd.quantity
                   // console.log(req.body.quantity, cartQuantity)
                    updatedQuantity = parseInt(req.body.quantity) + parseInt(cartQuantity)
                    foundProd.quantity = updatedQuantity
                     // total price for the product
                    const total = parseInt(updatedQuantity) * parseInt(price)
                    foundProd.totalPrice = total

                    user.save((err)=>{
                        if(err) { 
                            console.log(err)  
                        }else{  
                            res.redirect('/shop/cart')
                        }
                    })
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
        if (req.user){
            // console.log(result)
              await User.findById(req.user._id).populate('cart.product').exec( (err, user) => {
                console.log(user)
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
                    subtotal: subtotal,
                 })
            });
        }
        else {
            res.render('shop/cart', { 
                title: 'Simpleton',
                user: req.user,
                products: []
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
            // console.log(user.cart)
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

                // implementing Stripe
                // here we want to return the session key
                return  stripe.checkout.sessions.create({
                    payment_method_types: ['card'],
                    line_items: products.map(el => {
                        return{
                        name: el.product.title,
                        quantity: el.quantity,
                        amount: parseInt(el.product.retailPrice) * 100,
                        images: [el.product.media.imageUrl],
                        currency: 'cad'
                    };
                    }),

                    mode: 'payment',
                    success_url: `${req.protocol}://${req.get('host')}/shop/cart/checkout/success`,
                    cancel_url: `${req.protocol}://${req.get('host')}/shop/cart/checkout/cancel`,
                })
            })
            .then(session => {
                console.log(products)
                res.render('shop/checkout', {
                    title: 'Simpleton',
                    user: req.user,
                    products: products, //cart items
                    length: products.length,
                    subtotal: subtotal,
                    sessionId: session.id
                })
            })
            .catch(err => {
                console.log(err)
            })
        }else {
            res.redirect('/auth/google')
        }
}

// sending Mail
const transporter = nodemailer.createTransport(sendgridTransport({
    auth: {
      api_key: process.env.NODEMAILER_API_KEY //gotten from the send grid.
    }
  }))


// successful payment
const getCheckoutSuccess = async (req, res) => {
    try{
       
        if (req.user){
            let paid = 0;
            await User.findById(req.user._id).populate('cart.product').exec( (err, user) => {
                const products = user.cart.map(el => {
                    paid += parseInt(el.totalPrice)
                    return {  product: { ...el.product._doc }, quantity: el.quantity, totalPrice: el.totalPrice};
                  });
                //   console.log(paid)
                  const order = new Order({
                    user: {
                      email: req.user.email,
                      userId: req.user
                    },
                    products: products,
                    paid: paid
                  });
                  order.save((err, result)=>{
                      if(err) { 
                          console.log(err)  
                        }else{  
                            req.user.cart = [];   //clear the cart
                            req.user.save((err) =>{
                                if(err){
                                    return err
                                }else{
                                    const orderedProd = products
                                    const orderedResult = result
                                    //create the pdf
                                    // let receipt = new PDFDocument({ size: "A4", margin: 50 });
                                    const createInvoice = () => {
                                        let receipt = new PDFDocument({ size: "A4", margin: 50 });
                                      
                                        generateHeader(receipt);
                                        generateCustomerInformation(receipt, orderedResult);
                                        generateInvoiceTable(receipt, orderedResult);
                                        generateFooter(receipt);
                                      
                                        //convert the pdf to buffer

                                        let buffers = [];
                                        receipt.on('data', buffers.push.bind(buffers));
                                        receipt.on('end', () => {

                                            const invoice = Buffer.concat(buffers);

                                            //send an email of the invoice
                                            transporter.sendMail({ 
                                                to: req.user.email, 
                                                from: process.env.MY_EMAIL,   
                                                subject: 'Your Simpleton Order',   
                                                text: `thank you for your order`,
                                                html:"<p>Thank you for shopping with us. We’ll send a confirmation once your item has shipped. Your order details are indicated below. If you would like to view the status of your order please visit Your Orders on Simpleton.com</p>"
                                                ,
                                                attachments : [{
                                                    filename: 'invoice.pdf',
                                                    content: invoice
                                                }]
                                                
                                              }).then(res => {
                                                  console.log('email sent')
                                                  console.log(res)
                                              })

                                        })
                                        receipt.end();
                                      }

                                     // generateHeader
                                    const generateHeader = (receipt) => {
                                        receipt
                                            // .text("Simpleton", 50, 45, { width: 50 }) // replace with logo
                                            .fillColor("#444444")
                                            .fontSize(20)
                                            .text("SIMPLETON", 110, 57)
                                            .fontSize(10)
                                            .text("123 Main Street", 200, 65, { align: "right" })
                                            .text("Toronto, Ca, A1B2C3", 200, 80, { align: "right" })
                                            .moveDown();

                                     }

                                    const generateCustomerInformation = (receipt, orderedResult) => {

                                        receipt
                                            .fillColor("#444444")
                                            .fontSize(20)
                                            .text("Invoice", 50, 160);

                                        generateHr(receipt, 185);

                                        const customerInformationTop = 200;
                                        
                                        receipt
                                            .fontSize(10)
                                            .text("Order Number:", 50, customerInformationTop)
                                            .font("Helvetica-Bold")
                                            .text(`${orderedResult._id}`, 150, customerInformationTop)
                                            .font("Helvetica")
                                            .text("Ordered Date:", 50, customerInformationTop + 15)
                                            .text(formatDate(new Date()), 150, customerInformationTop + 15)
                                            .text("Amount Paid:", 50, customerInformationTop + 30)
                                            .text(`$${orderedResult.paid}`,150,customerInformationTop + 30)
                                            .font("Helvetica-Bold")
                                            .text(`${orderedResult.user.userId.name}`, 300, customerInformationTop)
                                            .font("Helvetica")
                                            .text(`123 Abc Street, Toronto ON, CA`,300,customerInformationTop + 30)
                                            .moveDown();

                                        generateHr(receipt, 252);
                                    }
                                    const generateInvoiceTable = (receipt, orderedResult) => {
                                        let i;
                                        const invoiceTableTop = 330;
                                       receipt.font("Helvetica-Bold");
                                       generateTableRow(
                                         receipt,
                                         invoiceTableTop,
                                         "Item",
                                         "Description",
                                         "Unit Cost",
                                         "Quantity",
                                         "Total"
                                       );
                                       generateHr(receipt, invoiceTableTop + 20);
                                       receipt.font("Helvetica");

                                        //loop through the order item and fill the table
                                        for (i = 0; i < orderedProd.length; i++) {
                                            const item = orderedProd[i];
                                            const position = invoiceTableTop + (i + 1) * 30;
                                            generateTableRow(
                                            receipt,
                                            position,
                                            item.product.title,
                                            item.product.name,
                                            `$${item.product.retailPrice}`,
                                            item.quantity,
                                            `$${item.totalPrice}`
                                            );
                                            generateHr(receipt, position + 20);
                                        }

                                        const subtotalPosition = invoiceTableTop + (i + 1) * 30;
                                        generateTableRow(
                                          receipt,
                                          subtotalPosition,
                                          "",
                                          "",
                                          "Subtotal",
                                          "",
                                          `$${orderedResult.paid}`
                                        );
                                      
                                        const paidToDatePosition = subtotalPosition + 20;
                                        generateTableRow(
                                          receipt,
                                          paidToDatePosition,
                                          "",
                                          "",
                                          "Amount Paid",
                                          "",
                                          `$${orderedResult.paid}`
                                        );
                                    }

                                    const generateTableRow = (
                                        receipt,
                                        y,
                                        Item,
                                        Description,
                                        UnitCost,
                                        Quantity,
                                        Total
                                      ) => {
                                        receipt
                                          .fontSize(10)
                                          .text(Item, 50, y)
                                          .text(Description, 150, y)
                                          .text(UnitCost, 280, y, { width: 90, align: "right" })
                                          .text(Quantity, 370, y, { width: 90, align: "right" })
                                          .text(Total, 0, y, { align: "right" });
                                      }

                                    // generateFooter
                                    const generateFooter = (receipt) => {
                                        generateHr(receipt, 252);
                                        receipt
                                            .fontSize(10)
                                            .text(
                                            "Payment Received. Thank you for your business.",
                                            50,
                                            780,
                                            { align: "center", width: 500 }
                                            );
                                    }

                                    // generateHr
                                    const generateHr = (receipt, y) => {
                                        receipt
                                          .strokeColor("#aaaaaa")
                                          .lineWidth(1)
                                          .moveTo(50, y)
                                          .lineTo(550, y)
                                          .stroke();
                                    }
                                    const formatDate = (date) => {
                                        const day = date.getDate();
                                        const month = date.getMonth() + 1;
                                        const year = date.getFullYear();
                                        
                                        return year + "/" + month + "/" + day;
                                    }
                                    createInvoice()


                                    res.redirect('/shop/account/order')
                                }
                            })
                    }
                });
            })
        }else{
            res.redirect('/auth/google') 
        }
    }catch(err){
        console.log(err)
    }
}




// Get Orders

const getOrders = async (req, res, next) => {
    try{
        // const result = await Products.find();
        if(req.user){
            userEmail = req.user.email;
            const userOrder = await Order.find({'user.email': userEmail})
            
            console.log(userOrder)
            
            //  console.log(subtotal)
            res.render('shop/orders',{
                title: 'Simpleton',
                user: req.user,
                orders: userOrder,
                // products: result
            })
        }else{
            res.redirect('/auth/google')
        } 
   }catch(err){
       console.log(err)
   }
}


//remove product from the array
const removeOrderItem = async (req, res) => {
    try {
        const orderId = req.body.prodId
        console.log(orderId)
        await Order.findById(orderId, (err, order) => {
            console.log(order)
            order.remove()
            res.redirect('/shop/account/order')
        })
    }catch(err) {
        console.log(err)
    }
}




const getAccount = (req, res) => {

    try{
        if(req.user){
            res.render('shop/account',{
                title: 'Simpleton',
                user: req.user,
            })
        }else{
            res.redirect('/auth/google')
        }
    }catch(err){
        console.log(err)
    }
    
}


module.exports = {
    getHome,
    getCatalog,
    getOneProduct,
    postAddToCart,
    getCart,
    removeCartItem,
    getCheckout,
    getCheckoutSuccess,
    getOrders,
    removeOrderItem,
    getAccount, 

}