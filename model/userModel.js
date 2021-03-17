var mongoose = require('mongoose');
const {Schema}  = mongoose;



const cartSchema = new Schema ({
  product: {
    type: String,
    required: true
  },
  quantity: {
    type: Number,
    required: true
  }
})

const userSchema = new Schema({
  name: String,
  email: String,
  avatar: String,
  googleId: String,
  cart : [cartSchema]

}, {
  timestamps: true
});

module.exports = mongoose.model('User', userSchema);