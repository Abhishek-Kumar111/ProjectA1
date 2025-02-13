const Listing = require("../Model/listing.js");
const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding');
const mapToken = process.env.MAP_TOKEN;
const geocodingClient = mbxGeocoding({ accessToken: mapToken });
const ExpressError = require("../utils/ExpressError.js");

module.exports.index = async (req, res, next) => {

    let allList = await Listing.find({});
    res.render("listings/index.ejs", { allList });
};

module.exports.renderNewForm = (req, res) => {
    res.render("listings/new.ejs");
}

module.exports.saveNewListing = async (req, res, next) => {
     
    let response = await geocodingClient.forwardGeocode({
        query: req.body.Listing.location,
        limit: 1
      })
        .send()
        if (
            !response.body ||
            !response.body.features ||
            response.body.features.length === 0
          ) {
            throw new Error("Location not found. Please provide a valid address.");
          }  

    let url = req.file.path;
    let filename = req.file.filename;
    const newList = new Listing(req.body.Listing);
        
    newList.owner = req.user._id;
    newList.image = {filename,url};
    newList.geometry = response.body.features[0].geometry;
    let savedList = await newList.save();
    console.log(savedList);
    req.flash("success", "New Listing Created");
    res.redirect("/listing");
    
}

module.exports.showListing = async (req, res) => {
    const { id } = req.params;
    const list = await Listing.findById(id).populate({ path: "reviews", populate: { path: "author" } }).populate("owner");
    if (!list) {
        req.flash("error", "listing you requested doesn't exist!");
        res.redirect("/listing");
    }
    res.render("./listings/shows.ejs", { list });
}

module.exports.editForm = async (req, res) => {
    let { id } = req.params;
    let list = await Listing.findById(id);
    if (!list) {
        req.flash("error", "listing you requested doesn't exist!");
        res.redirect("/listing");
    }
    let orgImageUrl = list.image.url;
    let updatedurl = orgImageUrl.replace("/upload","/upload/e_grayscale/w_250");
    console.log(updatedurl);
    res.render("listings/edit.ejs", { list,updatedurl});
}

module.exports.updateListing = async (req, res) => {
    let { id } = req.params;

    let listing = await Listing.findByIdAndUpdate(id, { ...req.body.Listing }, { runValidators: true, new: true });
    if(typeof req.file !== 'undefined'){ //if new image is upploded
        let url = req.file.path;
        let filename = req.file.filename;
        listing.image = {filename,url};
        await listing.save();
    }
    req.flash("success", "Listing updated");
    res.redirect(`/listings/${id}`);
}

module.exports.deleteListing =  async (req, res) => {
    let { id } = req.params;
    await Listing.findByIdAndDelete(id);
    req.flash("success", "Listing Deleted");
    res.redirect("/listing");
}

module.exports.randomPath = (req, res, next) => {
    next(new ExpressError(404, "Page not found!"));

}