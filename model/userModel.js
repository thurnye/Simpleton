var mongoose = require('mongoose');



const userSchema = new mongoose.Schema({
  name: String,
  email: String,
  cohort: String,
  avatar: String,
  googleId: String,
  cart: {
    items: [
      {
        productId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Product',
          required: true
        },
        quantity: {
          type: Number,
          required: true
        }
      }
    ]
  }

}, {
  timestamps: true
});

module.exports = mongoose.model('User', userSchema);