const  mongoose  = require('mongoose');


const Schema = mongoose.Schema;

const orderSchema = new Schema({
    products: [{
        product: {type: Object, required: true},
        quatity: {type: Object, required: true}
    }],
    user: {
        email: {
            type: String,
            required: true
        },
        userId: {
            type: Schema.Types.ObjectId,
            required: true,
            ref: 'User'
        }
    }
})

module.exports = mongoose.model('Ordeer', orderSchema)