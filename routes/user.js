const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync.js");
const passport = require("passport");
const {saveRedirectUrl} = require("../middleware.js");
const userController = require("../controller/user.js");

//signup
router
 .route("/signup")
 .get(userController.renderSignupForm)
 .post(wrapAsync(userController.signupDone ));
//login
router
 .route("/login")
 .get(userController.renderLoginForm)
 .post(saveRedirectUrl,  passport.authenticate('local', { failureRedirect: '/login' ,failureFlash:true}),wrapAsync(userController.loginDone));

//logout
router.get("/logout",userController.logoutDone); 

module.exports = router;