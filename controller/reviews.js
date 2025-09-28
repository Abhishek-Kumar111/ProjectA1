const Review = require("../models/reviews.js");
const Listing = require("../models/listing.js");
module.exports.reviewListing = async (req, res) => {
    let listing = await Listing.findById(req.params.id);
    let newReview = new Review(req.body.Review);
    newReview.author = req.user._id;
    listing.reviews.push(newReview);
    await newReview.save();
    await listing.save();
    req.flash("success", "New review added");
    res.redirect(`/listings/${listing._id}`);
}

module.exports.deleteReview = async (req, res) => {
    let { id, revId } = req.params;
    await Listing.findByIdAndUpdate(id, { $pull: { reviews: revId } });
    await Review.findByIdAndDelete(revId);
    req.flash("success", "review deleted");
    res.redirect(`/listings/${id}`);
}
