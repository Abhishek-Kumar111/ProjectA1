const Booking = require("../models/booking.js");
const Listing = require("../models/listing.js");

// Show booking page
module.exports.showBooking = async (req, res) => {
  const { id } = req.params;
  const list = await Listing.findById(id).populate("bookings");
  res.render("booking/showBooking.ejs", { list ,currUser:req.user}); 
};

module.exports.showAllBooking = async (req, res) => {
       const {id} = req.params;
       const list = await Listing.findById(id).populate("bookings");
       res.render("booking/showAllBooking.ejs", { list ,currUser:req.user});
}
// Create booking
module.exports.createBooking = async (req, res) => {
 const { checkIn, checkOut } = req.body;
 
 const { id } = req.params;

  const userId = req.user._id.toString(); 

  if (new Date(checkIn) >= new Date(checkOut)) {
    req.flash("error", "Check-in date must be before check-out date.");
    return res.redirect(`/listings/${id}/booking`);
  }

  // check for conflict
  const conflict = await Booking.findOne({
    listingId: id,
    $or: [
      { checkIn: { $lt: new Date(checkOut), $gte: new Date(checkIn) } },
      { checkOut: { $gt: new Date(checkIn), $lte: new Date(checkOut) } },
      { checkIn: { $lte: new Date(checkIn) }, checkOut: { $gte: new Date(checkOut) } }
    ]
  });

  if (conflict) {
    req.flash("error", "Selected dates are already booked!");
    return res.redirect(`/listings/${id}/booking`);
  }


  // create booking
  const booking = new Booking({
    listingId: id,
    userId, 
    checkIn: new Date(checkIn),
    checkOut: new Date(checkOut)
  });
  console.log("req.body:", req.body);
console.log("checkIn:", req.body.checkIn);
console.log("checkOut:", req.body.checkOut);


  await booking.save();
  req.flash("success", "Booking successful!");
  res.redirect(`/listings/${id}/booking`);
  
};

module.exports.deleteBooking = async (req, res) => {
    const { id, bookingId } = req.params;
    await Booking.findByIdAndDelete(bookingId);
    await Listing.findByIdAndUpdate(id, { $pull: { bookings: bookingId } });
    req.flash("success", "Booking cancelled successfully!");
    res.redirect(`/listings/${id}/booking`);
};

module.exports.deleteBookingByOwner = async (req, res) => {
    const { id, bookingId } = req.params;
    await Booking.findByIdAndDelete(bookingId);
    await Listing.findByIdAndUpdate(id, { $pull: { bookings: bookingId } });
    req.flash("success", "Booking cancelled successfully!");
    res.redirect(`/listings/${id}/allBooking`);
};
