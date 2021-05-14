const mongoose = require('mongoose');
const {Schema} = mongoose;


const productsSchema = new Schema({
    name: {
        type: String,
        require: true
    },
    // description: {
    //     type: String,
    //     require: true
    // },
    // price: {
    //     type: Number,
    //     require: true
    // },
    // ratings: {
    //     type: String,
    //     require: true
    // },
    // image: {
    //     type: String,
    // },
    // delivery: {
    //     type: String,,
    // },
    // category: {
    //     type: String,
    // },
    // season: {
    //     type: String,
    //     // enum: ['Winter', 'Spring', 'Summer', 'Fall'],
    // },
    // feature: {
    //     type: String,
    //     // enum: ['New Arrival', 'Best Seller', 'Featuring', 'Special Offer'],
    // },
    brand: {
        type: String,
    },
    colorway: {
        type: String,
    },
    gender: {
        type: String,
    },
    
    releaseDate: {
        type: String,
    },
    retailPrice:{
        type: Number,
        default: 0
    },
    
    styleId: {
        type: String,
    },
    
    title: {
        type: String,
    },
    year: {
        type: Number,
    },
    media: {
        imageUrl: {
            type: String,

        },
        smallImageUrl: {
            type: String,

        },
        thumbUrl: {
            type: String,

        }
    },

})

module.exports = mongoose.model('Products', productsSchema);