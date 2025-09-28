const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  listingId: { type: mongoose.Schema.Types.ObjectId, ref: "Listing", required: true },
  bookingId: { type: mongoose.Schema.Types.ObjectId, ref: "Booking", required: true },
  mobile_no : {type: Number, required: true},
  razorpay_order_id: { type: String, required: true },
  razorpay_payment_id: { type: String },
  razorpay_signature: { type: String },

  amount: { type: Number, required: true },
  status: { 
    type: String, 
    enum: ["pending", "paid", "failed", "refunded"],
    default: "pending"
  },

  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model("Payment", paymentSchema);
