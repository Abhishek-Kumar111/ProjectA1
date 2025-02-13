const mongoose = require('mongoose');
const User = require("./user.js");
const Schema = mongoose.Schema;
const reviewSchema = new Schema({
  rating: {
    type: Number,
  },
  comment: {
    type: String,
  },
  createdAt: {
    type: Date,
    default:Date.now() 
  },
  author:{
    type: Schema.Types.ObjectId,
    ref:"User"
  }
});

const Review = mongoose.model('Review', reviewSchema);

module.exports = Review;
