var mongoose = require('mongoose');
const {Schema} = mongoose


const userSchema = new Schema({
  name: String,
  email: String,
  avatar: String,
  googleId: String,
  cart: [
    {
      productId: {
        type: Schema.Types.ObjectId,
        ref: 'Products',
      },
      quantity: {
        type: Number,
      },
      totalPrice: {
        type: Number,
      }
    }
  ]
}, {
  timestamps: true
});

module.exports = mongoose.model('User', userSchema);