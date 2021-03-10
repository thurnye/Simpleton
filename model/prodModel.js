const mongoose = require('mongoose');
const {Schema} = mongoose;


const productsSchema = new Schema({
    name: {
        type: String,
        require: true
    },
    description: {
        type: String,
        require: true
    },
    price: {
        type: Number,
        require: true
    },
    ratings: {
        type: String,
        require: true
    },
    imageUrl: {
        type: String,
        required: true
    },
    delivery: {
        type: String,
        required: true,
    },
    category: {
        type: String,
        required: true
    }
})

module.exports = mongoose.model('Products', productsSchema);