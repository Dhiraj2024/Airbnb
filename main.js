if (process.env.NODE_ENV !== "production") {
    require("dotenv").config();
}
const express = require("express");
const app = express();
const mongoose = require("mongoose");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const cookieParser = require("cookie-parser");
const session = require("express-session");
const MongoStore = require("connect-mongo");
const flash = require("connect-flash");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const ExpressError = require("./utils/ExpressEroor.js");
const User = require("./models/user.js");
// Routers
const listingsRouter = require("./routes/listing.js");
const reviewsRouter = require("./routes/review.js");
const userRouter = require("./routes/user.js");

// ======================
// DATABASE CONNECTION
// ======================

const dbUrl = process.env.ATLASDB_URL;
async function main() {
await mongoose.connect(dbUrl);
}


main()
    .then(() => console.log("MongoDB Connected Successfully"))
    .catch((err) => console.log("DB ERROR:", err));


// ======================
// VIEW & STATIC
// ======================

app.engine("ejs", ejsMate);
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.static(path.join(__dirname, "public")));

app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.use(cookieParser("secret"));


// ======================
// SESSION STORE
// ======================

const store = MongoStore.create({
    mongoUrl: dbUrl,
    crypto: { secret: process.env.SECRET },
    touchAfter: 24 * 3600,
});

store.on("error", (e) => {
    console.log("SESSION STORE ERROR", e);
});

const sessionOptions = {
    store,
    secret: process.env.SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
        maxAge: 1000 * 60 * 60 * 24 * 7,
        httpOnly: true,
    },
};

app.use(session(sessionOptions));
app.use(flash());


// ======================
// PASSPORT AUTH
// ======================

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());


// ======================
// GLOBAL VARIABLES
// ======================

app.use((req, res, next) => {
    res.locals.currUser = req.user;
    res.locals.successMsg = req.flash("success");
    res.locals.errorMsg = req.flash("error");
    next();
});





// ======================
// ROUTES
// ======================

// HOME ROUTE FIX
app.get("/", (req, res) => {
    res.redirect("/listings");
});


app.use("/listings", listingsRouter);
app.use("/listings/:id/reviews", reviewsRouter);
app.use("/", userRouter);


// ======================
// 404 HANDLER
// ======================

app.use((req, res, next) => {
    next(new ExpressError(404, "Page Not Found"));
});


// ======================
// ERROR HANDLER
// ======================

app.use((err, req, res, next) => {
    const { statusCode = 500 } = err;
    const message = err.message || "Something went wrong!";
    res.status(statusCode).render("error.ejs", { err, message });
});


// ======================
// SERVER
// ======================

const port = process.env.PORT || 8090;
app.listen(port, () => {
    console.log("Server running on port", port);
});
