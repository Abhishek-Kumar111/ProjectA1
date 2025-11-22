if(process.env.NODE_ENV != "producation"){
    require('dotenv').config();
}
console.log(process.env); 

const express = require("express");
const app = express();
const path = require("path");
const mongoose = require('mongoose');
const methodOverride = require('method-override');
const wrapAsync = require("./utils/wrapAsync.js");
const ExpressError = require('./utils/ExpressError');

// Stripe initialization
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY || 'sk_test_placeholder');



//controller
const listingController = require("./controller/listing.js");
const reviewsController = require("./controller/reviews.js");
const bookingController = require("./controller/booking.js");

//passport
const passport = require("passport");
const LocalStrategy = require("passport-local");
const User = require("./models/user.js");
const { isLoggedIn, isOwner, validateReviews, validateListing ,isReviewAuthor} = require("./middleware.js");

//use of ejs-mate (for boilar-plate) 
engine = require("ejs-mate");
app.engine("ejs", engine);

//for image upload
const multer  = require('multer');
const { storage } = require("./cloudConfig.js");
const upload = multer({ storage });                

//use of static file(css)
app.use(express.static(path.join(__dirname, "PUBLIC")));
app.use('/flatpickr', express.static(__dirname + '/node_modules/flatpickr'));

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(methodOverride('_method'));

const dbURL = process.env.ATLASDB_URL;

main()
   .then(() => {
       console.log("Connected to MongoDB");
   })
   .catch(err => console.log(err));

async function main() {
       await mongoose.connect(dbURL)
       .then(() => console.log("Database connection successful"))
       .catch((err) => console.error("Database connection error:", err));
  }    

//session 
const session = require('express-session');
const MongoStore = require('connect-mongo');
const flash = require('connect-flash');

const store = MongoStore.create({
   mongoUrl: dbURL,
   crypto:{
       secret: process.env.SECRET,
   },
   touchAfter: 24*3600,
});

store.on("error", () => {
   console.log("error in mongo");
});

const sessionOptions = {
   store,
   secret: process.env.SECRET,
   resave: false,
   saveUninitialized: true,
   cookie: {
       expires: Date.now() + 7 * 24 * 60 * 60 * 1000,
       maxAge: 7 * 24 * 60 * 60 * 1000,
       httpOnly: true,
   },
};

app.use(session(sessionOptions));
app.use(flash());

//passport
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req, res, next) => {
   res.locals.success = req.flash("success") || [];
   res.locals.error = req.flash("error") || [];
   res.locals.currUser = req.user;
   next();
});

//passport route
const userRouter = require("./routes/user.js");
app.use("/", userRouter);

//  Home Route
app.get("/", (req, res) => {
   res.render("home.ejs"); 
});

// Listings Routes
app.get("/listings", wrapAsync(listingController.index)); 
app.get("/listings/new", isLoggedIn, listingController.renderNewForm);
app.post("/listings", isLoggedIn, validateListing, upload.single('Listing[image]'), wrapAsync(listingController.saveNewListing));
app.get("/listings/:id", wrapAsync(listingController.showListing));
app.get("/listings/:id/edit", isLoggedIn, wrapAsync(listingController.editForm));
app.patch("/listings/:id", isLoggedIn, isOwner, upload.single('Listing[image]'), wrapAsync(listingController.updateListing));
app.delete("/listings/:id", isLoggedIn, isOwner, wrapAsync(listingController.deleteListing));

// //booking routes
app.get("/listings/:id/booking",isLoggedIn, wrapAsync(bookingController.showBooking)); 
app.get("/listings/:id/allBooking", isLoggedIn, wrapAsync(bookingController.showAllBooking));

// Entire booking deletion (user and owner)
app.delete("/listings/:id/booking/:bookingId", isLoggedIn, wrapAsync(bookingController.deleteBooking));
app.delete("/listings/:id/allBooking/:bookingId", isLoggedIn, wrapAsync(bookingController.deleteBookingByOwner));

// Reviews Routes
app.post("/listings/:id/reviews", isLoggedIn, validateReviews, wrapAsync(reviewsController.reviewListing));
app.delete("/listings/:id/reviews/:revId", isLoggedIn, isReviewAuthor, wrapAsync(reviewsController.deleteReview));

//PAYMENT ROUTES

const Booking = require("./models/booking.js");
const Listing = require("./models/listing.js");
const Payment = require("./models/payment.js");
const paymentRouter = require("./routes/payment");
app.use("/", paymentRouter);

// app.post("/book-and-pay", isLoggedIn, wrapAsync(async (req, res) => {
//     try {
//         // Check if Stripe is properly configured
//         if (!process.env.STRIPE_SECRET_KEY || process.env.STRIPE_SECRET_KEY === 'sk_test_placeholder') {
//             return res.status(400).json({ error: "Stripe is not configured. Please add your Stripe secret key to the environment variables." });
//         }

//         const { userId, listingId, checkIn, checkOut, guests, phone } = req.body;
       
//         // Step 0: Parse and validate dates
//         const reqCheckIn = new Date(checkIn);
//         const reqCheckOut = new Date(checkOut);
//         if (!(reqCheckIn instanceof Date && !isNaN(reqCheckIn)) || !(reqCheckOut instanceof Date && !isNaN(reqCheckOut))) {
//             return res.status(400).json({ error: "Invalid check-in or check-out date." });
//         }
//         if (reqCheckOut <= reqCheckIn) {
//             return res.status(400).json({ error: "Check-out date must be after check-in date." });
//         }

//         // Step 1: Ensure no overlap with existing bookings (pending or confirmed)
//         const overlappingBooking = await Booking.findOne({
//             listingId: listingId,
//             status: { $in: ["pending", "confirmed"] },
//             $and: [
//                 { checkIn: { $lt: reqCheckOut } },   // existing starts before requested end
//                 { checkOut: { $gt: reqCheckIn } }    // existing ends after requested start
//             ]
//         });
//         if (overlappingBooking) {
//             return res.status(400).json({ error: "Selected dates overlap with an existing booking. Please choose different dates." });
//         }

//         // Step 2: Calculate total price
//         const nights = Math.ceil((reqCheckOut - reqCheckIn) / (1000 * 60 * 60 * 24));
//         if (nights <= 0) {
//             return res.status(400).json({ error: "Check-out date must be after check-in date." });
//         }
//         // Always fetch trusted price from DB to prevent client tampering
//         const listing = await Listing.findById(listingId);
//         if (!listing) {
//             return res.status(404).json({ error: "Listing not found." });
//         }
//         const pricePerNight = Number(listing.price) || 0;
//         const totalPrice = nights * pricePerNight;

//         // Stripe minimum amount check (₹50 in INR)
//         const unitAmount = Math.round(totalPrice * 100); // in paisa
//         const MIN_INR = 5000; 
//         if (unitAmount < MIN_INR) {
//             return res.status(400).json({ error: "Minimum charge is ₹50. Increase nights or choose a different listing." });
//         }

//         // Step 3: Create a 'pending' booking in your database
//         const booking = new Booking({
//             userId,
//             listingId,
//             checkIn: reqCheckIn,
//             checkOut: reqCheckOut,
//             guests,
//             totalPrice,
//             phone,
//             status: "pending"
//         });
//         await booking.save();

//         // Step 4: Create a Stripe Checkout Session
//         const baseUrl = `${req.protocol}://${req.get('host')}`;
//         const session = await stripe.checkout.sessions.create({
//             payment_method_types: ["card"],
//             mode: "payment",
//             line_items: [{
//                 price_data: {
//                     currency: "inr",
//                     product_data: {
//                         name: "StayScape Booking",
//                     },
//                     unit_amount: unitAmount,
//                 },
//                 quantity: 1,
//             }],
//             success_url: `${baseUrl}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
//             cancel_url: `${baseUrl}/payment/cancel?bookingId=${booking._id}`,
//         });

//         // Step 5: Create a 'pending' payment record in your database
//         const payment = new Payment({
//             userId,
//             listingId,
//             bookingId: booking._id,
//             amount: totalPrice,
//             stripe_session_id: session.id,
//             status: "pending"
//         });
//         await payment.save();

//         // Step 6: Send the session ID back to the client
//         res.json({ id: session.id });
//     } catch (err) {
//         return res.status(400).json({ error: err && err.message ? err.message : "Unable to start checkout." });
//     }
// }));

// app.get("/payment/success", wrapAsync(async (req, res) => {
//     const { session_id } = req.query;
//     const session = await stripe.checkout.sessions.retrieve(session_id);

//     if (session.payment_status === "paid") {
//         // Find the corresponding payment record
//         const payment = await Payment.findOneAndUpdate(
//             { stripe_session_id: session.id },
//             { status: "paid", stripe_payment_intent: session.payment_intent },
//             { new: true }
//         );

//         // If payment record is found and updated, update the booking status
//         if (payment && payment.bookingId) {
//             await Booking.findByIdAndUpdate(payment.bookingId, { status: "confirmed" });
//             req.flash("success", "Payment successful and your booking is confirmed!");
//             res.redirect(`/listings/${payment.listingId}`); // Redirect to the listing page
//         } else {
//              req.flash("error", "There was an issue confirming your booking.");
//              res.redirect("/");
//         }
//     } else {
//         req.flash("error", "Payment was not completed successfully.");
//         res.redirect("/");
//     }
// }));

// app.get("/payment/cancel", wrapAsync(async (req, res) => {
//     const { bookingId } = req.query;
//     if (bookingId) {
//         // Find the associated payment and delete it
//         await Payment.deleteOne({ bookingId: bookingId });
//         // Find the booking and delete it
//         const cancelledBooking = await Booking.findByIdAndDelete(bookingId);
//         req.flash("error", "Payment was cancelled. Your booking has been removed.");
//         // Redirect to the original listing page if possible
//         if(cancelledBooking) {
//             res.redirect(`/listings/${cancelledBooking.listingId}`);
//         } else {
//             res.redirect('/listings');
//         }
//     } else {
//         res.redirect('/listings');
//     }
// }));



// Fixed Catch-All Route (404 Handler)
app.all("*", (req, res, next) => {
   next(new ExpressError(404, "Page not found!"));
});

// Proper Error Handling Middleware
app.use((err, req, res, next) => {
   const { statusCode = 500 } = err;
   res.status(statusCode).render("error.ejs", { err });
});

// Correct Port Configuration
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
   console.log(`App is listening on port ${PORT}`);
});
