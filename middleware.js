const passport = require("passport");
const ExpressError = require("./utils/ExpressError.js");
const { listingSerSchema, listingReview} = require("./ListingSerSchema.js");
const Listing = require("./Model/listing.js");
const Review = require("./Model/reviews.js");
module.exports.isLoggedIn = (req,res,next)=>{
    if(!req.isAuthenticated()){
        req.session.redirectUrl = req.originalUrl;
        req.flash("error","you must be logged in to create listing!");
        return res.redirect("/login");
    }
    next();
}
 
module.exports.saveRedirectUrl = (req,res,next)=>{
    if( req.session.redirectUrl){
        res.locals.redirectUrl =  req.session.redirectUrl;
    }
    next();
};

module.exports.isOwner = async (req,res,next)=>{
    let {id} = req.params;
    let listing = await Listing.findById(id);
    if(!listing.owner.equals(res.locals.currUser._id)){
        req.flash("error","You are not owner of this listing");
        return res.redirect("/listing");
    }
    next();
}

module.exports.validateListing = (req,res,next)=>{
    let {error} =  listingSerSchema.validate(req.body.Listing);
    console.log(req.body);
    if(error){
        let errmsg = error.details.map((el)=>el.message).join(",");
        throw new ExpressError(400,errmsg);
    }else{
        next();
    }
};

module.exports.validateReviews = (req,res,next)=>{
    let {error} = listingReview.validate(req.body);
    if(error){
        let errmsg = error.details.map((el)=>el.message).join(",");
        throw new ExpressError(400,errmsg);
    }else{
        next();
    }
};

module.exports.isReviewAuthor = async (req,res,next)=>{
    let {id,revId} = req.params;
    let review = await Review.findById(revId);
    if(!review.author.equals(res.locals.currUser._id)){
        req.flash("error","You are not owner of this listing");
        return res.redirect(`/listings/${id}`);
    }
    next();
}


