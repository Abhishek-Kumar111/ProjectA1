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

//controller
const listingController = require("./controller/listing.js");
const reviewsController = require("./controller/reviews.js");

//passport
const passport = require("passport");
const LocalStrategy = require("passport-local");
const User = require("./Model/user.js");
const { isLoggedIn, isOwner, validateReviews, validateListing ,isReviewAuthor} = require("./middleware.js");

//use of ejs-mate (for boilar-plate) 
engine = require("ejs-mate");
app.engine("ejs", engine);

//for image uppload
const multer  = require('multer');

const {storage} = require("./cloudConfig.js");
const upload = multer({ storage});                

//use of static file(css)
app.use(express.static(path.join(__dirname, "PUBLIC")));
app.set("view engine", "ejs");

app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({ extended: true }));

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


//pasport route
const userRouter = require("./routes/user.js");
app.use("/", userRouter);

//home route
// app.get("/", (req, res) => {
//     res.send("This is home route");
// });

// Index routing
app.get("/listing",wrapAsync(listingController.index));

// adding new 
app.get("/listing/new",isLoggedIn, listingController.renderNewForm);
app.post("/listings",isLoggedIn, validateListing,upload.single('Listing[image]'), wrapAsync(listingController.saveNewListing));

//show rout
app.get("/listings/:id", wrapAsync(listingController.showListing));

//edit list
app.get("/listings/:id/edit", isLoggedIn, wrapAsync(listingController.editForm));

//update 
app.patch("/listings/:id", isLoggedIn, isOwner,upload.single('Listing[image]'), wrapAsync(listingController.updateListing));

//Delete
app.delete("/listings/:id", isLoggedIn, isOwner,wrapAsync(listingController.deleteListing));

//Reviews
app.post("/listings/:id/reviews", isLoggedIn, validateReviews, wrapAsync(reviewsController.reviewListing));

//reviews deletes
app.delete("/listings/:id/reviews/:revId", isLoggedIn,isReviewAuthor, wrapAsync(reviewsController.deleteReview));

//for all randam path
app.use("*", listingController.randomPath);

// Error handler 
app.use((err, req, res, next) => {
    const { statusCode = 500 } = err;
    res.status(statusCode).render("error.ejs", { err });
});

app.listen(8080, () => {
    console.log("App is listening on port 8080");
});
