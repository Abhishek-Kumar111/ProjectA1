const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  listingId: { type: mongoose.Schema.Types.ObjectId, ref: "Listing", required: true },
  checkIn: Date,
  checkOut: Date,
  guests: Number,
  totalPrice: Number,
  // Phone number provided and verified at booking time (E.164 recommended)
  phone: { type: String },
  status: { type: String, enum: ["pending","confirmed","cancelled"], default: "pending" },
  createdAt: { type: Date, default: Date.now }
});

// middleware to push booking into listing
bookingSchema.post("save", async function(doc) {
  const Listing = require("./listing");
  await Listing.findByIdAndUpdate(doc.listingId, {
    $push: { bookings: doc._id }
  });
});

const Booking = mongoose.model("Booking", bookingSchema);
module.exports = Booking;
