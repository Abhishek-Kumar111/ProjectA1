const Booking = require("../models/booking.js");
const Listing = require("../models/listing.js");
const Payment = require("../models/payment.js");
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY || 'sk_test_placeholder');

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


module.exports.deleteBooking = async (req, res) => {
    const { id, bookingId } = req.params;
    // Find any related payment
    const payment = await Payment.findOne({ bookingId });
    if (payment) {
        if (payment.status === 'paid' && payment.stripe_payment_intent) {
            try {
                await stripe.refunds.create({ payment_intent: payment.stripe_payment_intent });
                payment.status = 'refunded';
                await payment.save();
            } catch (e) {
                req.flash("error", "Unable to refund payment. Please contact support.");
                return res.redirect(`/listings/${id}/booking`);
            }
        } else {
            await Payment.deleteOne({ _id: payment._id });
        }
    }
    await Booking.findByIdAndDelete(bookingId);
    await Listing.findByIdAndUpdate(id, { $pull: { bookings: bookingId } });
    req.flash("success", "Booking cancelled successfully!");
    res.redirect(`/listings/${id}/booking`);
};

module.exports.deleteBookingByOwner = async (req, res) => {
    const { id, bookingId } = req.params;
    const payment = await Payment.findOne({ bookingId });
    if (payment) {
        if (payment.status === 'paid' && payment.stripe_payment_intent) {
            try {
                await stripe.refunds.create({ payment_intent: payment.stripe_payment_intent });
                payment.status = 'refunded';
                await payment.save();
            } catch (e) {
                req.flash("error", "Unable to refund payment. Please contact support.");
                return res.redirect(`/listings/${id}/allBooking`);
            }
        } else {
            await Payment.deleteOne({ _id: payment._id });
        }
    }
    await Booking.findByIdAndDelete(bookingId);
    await Listing.findByIdAndUpdate(id, { $pull: { bookings: bookingId } });
    req.flash("success", "Booking cancelled successfully!");
    res.redirect(`/listings/${id}/allBooking`);
};

