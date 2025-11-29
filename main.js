if (process.env.NODE_ENV !== "production") {
    require("dotenv").config();
}

const express = require("express");
const app = express();
const mongoose = require('mongoose');
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const cookieParser = require("cookie-parser");
const session = require("express-session");
const MongoStore = require("connect-mongo");
const flash = require("connect-flash");
const passport = require("passport");
const LocalStrategy = require("passport-local");

const ExpressError = require("./utils/ExpressEroor.js"); // ✅ typo fix
const User = require("./models/user.js");

// Routers
const listingsRouter = require("./routes/listing.js");
const reviewsRouter = require("./routes/review.js");
const userRouter = require("./routes/user.js");

// DB connection URL
const dbUrl = process.env.ATLASDB_URL;

// -------------------- MIDDLEWARE SETUP --------------------

// Static files
app.use(express.static(path.join(__dirname, "public")));

// Views
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.engine('ejs', ejsMate);

// Parsing
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));

// Cookies
app.use(cookieParser("secretcode"));


app.use((req, res, next) => {
    res.locals.currUser = req.user;
    next();
});

// Session store
const store = MongoStore.create({
    mongoUrl: dbUrl,
    mongoOptions: {
        retryWrites: true,
        w: "majority"
    },
    crypto: { secret: process.env.SECRET },
    touchAfter: 24 * 3600
});

store.on("error", (err) => {
    console.log("Error in mongo session store:", err);
});

const sessionOptions = {
    store,
    secret: process.env.SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: {
        expires: Date.now() + 7 * 24 * 60 * 1000,
        maxAge: 7 * 24 * 60 * 60 * 1000,
        httpOnly: true,
    },
};
app.use(session(sessionOptions));

// Flash
app.use(flash());

// Passport
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// -------------------- GLOBAL VARIABLES FOR VIEWS --------------------
app.use((req, res, next) => {
    res.locals.successMsg = req.flash("success");
    res.locals.errorMsg = req.flash("error");
    res.locals.currUser = req.user;
    next();
});

// -------------------- ROUTES --------------------

// App routers
app.use("/listings", listingsRouter);
app.use("/listings/:id/reviews", reviewsRouter);
app.use("/", userRouter);

// -------------------- ERROR HANDLING --------------------

// 404 handler
app.use((req, res, next) => {
    next(new ExpressError(404, "Page not found"));
});

// General error handler
app.use((err, req, res, next) => {
    const { statusCode = 500, message = "Something went wrong" } = err;
    if (res.headersSent) return next(err);
    res.status(statusCode).render("error.ejs", { err, message });
});

// -------------------- DATABASE CONNECTION --------------------
async function main() {
    await mongoose.connect(dbUrl);
}

main()
    .then(() => console.log("Connection successful"))
    .catch(err => console.log(err));

// -------------------- SERVER START --------------------
const port = process.env.PORT || 8090;
app.listen(port, () => {
    console.log(`App is listening on port ${port}`);
});
