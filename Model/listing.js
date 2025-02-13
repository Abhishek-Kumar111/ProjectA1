const mongoose = require("mongoose");
const User = require("./user.js");
const Review = require("./reviews.js");
const Schema = mongoose.Schema;

const listingSchema = new Schema({
    title: {
        type: String,
        required: true
    },
    description: String,
    image: {
        filename: {
            type: String,
            default: 'default-image.jpg'
        },
        url: {
            type: String,
            default: "https://images.unsplash.com/photo-1727791962712-1d36ec09b068?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
        }
    },
    price: Number,
    country: String,
    location: String,

    reviews:[{
        type: Schema.Types.ObjectId,
        ref: "Review"
    }],
    owner:{
        type: Schema.Types.ObjectId,
        ref: "User"
    },
    geometry: {
        type: {
          type: String, // Don't do `{ location: { type: String } }`
          enum: ['Point'], // 'location.type' must be 'Point'
          required: true
        },
        coordinates: {
          type: [Number],
          required: true
        },
      },
    

});
listingSchema.post("findOneAndDelete",async(listing)=>{
    if(listing)
        await Review.deleteMany({_id:{$in: listing.reviews}});
});
const Listing = mongoose.model("Listing", listingSchema);
module.exports = Listing;
