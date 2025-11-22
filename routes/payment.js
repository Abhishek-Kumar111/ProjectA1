// routes/payment.js
const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync");
const { isLoggedIn } = require("../middleware");

const paymentController = require("../controller/payment");

// BOOK & PAY (Checkout start)
router.post("/book-and-pay", isLoggedIn, wrapAsync(paymentController.startCheckout));

// SUCCESS CALLBACK
router.get("/payment/success", wrapAsync(paymentController.paymentSuccess));

// CANCEL CALLBACK
router.get("/payment/cancel", wrapAsync(paymentController.paymentCancel));

module.exports = router;
