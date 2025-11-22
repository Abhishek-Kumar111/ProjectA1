// controller/payment.js
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY || 'sk_test_placeholder');

const Booking = require("../models/booking");
const Listing = require("../models/listing");
const Payment = require("../models/payment");

module.exports.startCheckout = async (req, res) => {
    if (!process.env.STRIPE_SECRET_KEY || process.env.STRIPE_SECRET_KEY === 'sk_test_placeholder') {
        return res.status(400).json({ error: "Stripe is not configured." });
    }

    const { userId, listingId, checkIn, checkOut, guests, phone } = req.body;

    const reqCheckIn = new Date(checkIn);
    const reqCheckOut = new Date(checkOut);

    if (!(reqCheckIn instanceof Date) || !(reqCheckOut instanceof Date) || isNaN(reqCheckIn) || isNaN(reqCheckOut)) {
        return res.status(400).json({ error: "Invalid check-in or check-out date." });
    }
    if (reqCheckOut <= reqCheckIn) {
        return res.status(400).json({ error: "Check-out must be after check-in." });
    }

    const overlappingBooking = await Booking.findOne({
        listingId,
        status: { $in: ["pending", "confirmed"] },
        $and: [
            { checkIn: { $lt: reqCheckOut } },
            { checkOut: { $gt: reqCheckIn } }
        ]
    });
    if (overlappingBooking)
        return res.status(400).json({ error: "Selected dates overlap with an existing booking." });

    const listing = await Listing.findById(listingId);
    if (!listing) return res.status(404).json({ error: "Listing not found." });

    const nights = Math.ceil((reqCheckOut - reqCheckIn) / (1000 * 60 * 60 * 24));
    const pricePerNight = Number(listing.price) || 0;
    const totalPrice = nights * pricePerNight;

    const unitAmount = Math.round(totalPrice * 100);
    if (unitAmount < 5000) {
        return res.status(400).json({ error: "Minimum charge is ₹50." });
    }

    const booking = await Booking.create({
        userId, listingId, checkIn: reqCheckIn, checkOut: reqCheckOut,
        guests, totalPrice, phone, status: "pending"
    });

    const baseUrl = `${req.protocol}://${req.get('host')}`;

    const session = await stripe.checkout.sessions.create({
        payment_method_types: ["card"],
        mode: "payment",
        line_items: [{
            price_data: {
                currency: "inr",
                product_data: { name: "StayScape Booking" },
                unit_amount: unitAmount,
            },
            quantity: 1
        }],
        success_url: `${baseUrl}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${baseUrl}/payment/cancel?bookingId=${booking._id}`
    });

    await Payment.create({
        userId,
        listingId,
        bookingId: booking._id,
        amount: totalPrice,
        stripe_session_id: session.id,
        status: "pending"
    });

    res.json({ id: session.id });
};


// SUCCESS CONTROLLER
module.exports.paymentSuccess = async (req, res) => {
    const { session_id } = req.query;

    const session = await stripe.checkout.sessions.retrieve(session_id);

    if (session.payment_status !== "paid") {
        req.flash("error", "Payment not completed.");
        return res.redirect("/");
    }

    const payment = await Payment.findOneAndUpdate(
        { stripe_session_id: session.id },
        { status: "paid", stripe_payment_intent: session.payment_intent },
        { new: true }
    );

    if (!payment) {
        req.flash("error", "Payment record not found.");
        return res.redirect("/");
    }

    await Booking.findByIdAndUpdate(payment.bookingId, { status: "confirmed" });

    req.flash("success", "Payment successful & booking confirmed!");
    res.redirect(`/listings/${payment.listingId}`);
};


// CANCEL CONTROLLER
module.exports.paymentCancel = async (req, res) => {
    const { bookingId } = req.query;

    if (!bookingId) return res.redirect("/listings");

    await Payment.deleteOne({ bookingId });
    const cancelledBooking = await Booking.findByIdAndDelete(bookingId);

    req.flash("error", "Payment cancelled. Booking removed.");

    if (cancelledBooking) {
        return res.redirect(`/listings/${cancelledBooking.listingId}`);
    } else {
        return res.redirect("/listings");
    }
};
