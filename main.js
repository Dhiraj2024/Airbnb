if (process.env.NODE_ENV != "production") {
require("dotenv").config();
}
//console.log(process.env.SECRETE);

const express = require("express");
const app = express();
const mongoose = require('mongoose');
//const Listing = require("./models/listing.js");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
//const wrapAsync = require("./utils/wrapAsync.js");
//const { asyncWrapProviders } = require("async_hooks");
const ExpressError = require("./utils/ExpressEroor.js");
// const { listingSchema , reviewSchema } = require("./schema.js");
// const Review = require("./models/review.js");
const cookieParser = require("cookie-parser");
const listingsRouter = require("./routes/listing.js");
const reviewsRouter = require("./routes/review.js");
const session = require("express-session");
const MongoStore = require("connect-mongo");

const flash = require("connect-flash");
const LocalStrategy =require("passport-local");
const User = require("./models/user.js");
const passport = require("passport");
const userRouter = require("./routes/user.js");

//const MONGO_URL="mongodb://127.0.0.1:27017/wanderlust";   
const dbUrl = process.env.CLOUDINARY_ATLASDB_URL;

app.use(express.static(path.join(__dirname, "public")));//for css
app.set("view engine", "ejs");  // ⚡ "view-engine" nahi, "view engine"
app.set("views", path.join(__dirname, "views"));  // ✅ sahi function join()
 app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.engine('ejs',ejsMate);
//app.use(cookieParser());//cookies----------
app.use(cookieParser("secretcode"));//signed cookie

//for session data store long time  
const store = MongoStore.create({
  mongoUrl: dbUrl,
  crypto:{
    secret: process.env.CLOUDINARY_SECRET,
  },
  touchAfter: 24 * 3600,
});
store.on("error", () => {
  console.log("eror in mongo session store", err);
});


const sessionOptions = {
    store,
    secret: process.env.CLOUDINARY_SECRET,
    resave: false ,
    saveUninitialized: true,
    cookie: {
        expires: Date.now() + 7 * 24 * 60 * 1000,
        maxAge: 7*24*60*60*1000 , 
        httpOnly: true,
    },
};



app.use(session(sessionOptions));
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));


main()
.then(() => {
console.log("connection successfull");
})
.catch(err => {
    console.log(err);
});

async function main() {
 await  mongoose.connect(dbUrl);   
}

app.get("/", (req, res) => {
//   console.dir(req.cookies);
     res.send("Root is  working");
});

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());


//midleware for flash--------
app.use((req, res ,next ) =>{
  res.locals.successMsg  = req.flash("success");   // ✅ sahi key
    res.locals.errorMsg = req.flash("error");       // ✅ sahi key
  res.locals.currUser = req.user;
    next();
});


// app.get("/demouser", async(req, res, next) => {
//     let fakeUser = new User({
//         email: "student@gmail.com",
//         username: "delta-student",
//     });
// let registeredUser =await User.register(fakeUser, "pass");
// res.send(registeredUser);
// });



app.use("/listings",listingsRouter);
app.use("/listings/:id/reviews",reviewsRouter);
app.use("/",userRouter);

app.use((req, res, next) => {
  next(new ExpressError(404, "Page not found"));
});

app.use((err, req, res, next) => {
  const { statusCode = 500, message = "Something went wrong" } = err;
  if (res.headersSent) {   // prevent double response
    return next(err);
  }
  res.status(statusCode).render("error.ejs", { err, message });
});

app.listen(8090, () => {
    console.log(`app is listening on port 8090`);
});
//EFeCq5dxnyO5scnC

//mongodb+srv://dhiraj2062004p_db_user:EFeCq5dxnyO5scnC@cluster0.usgfc19.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0

 