const express = require("express");
const router = express.Router();
const User = require("../models/user.js");
const wrapAsync = require("../utils/wrapAsync.js");
const passport = require("passport");
const { saveRedirectUrl } = require("../middleware.js");

const userController = require("../controllers/users.js")

//signup
router.route("/signup")
.get(userController.renderSignup)
.post(wrapAsync(userController.Signup));

//login
router.route("/login")
.get(userController.renderLogin )
.post(
    saveRedirectUrl,
    passport.authenticate("local",{
     failureRedirect: "/login",
    failureFlash: true,
}), 
   userController.Login
);  

//logout------
router.get("/logout",userController.Logout);




module.exports = router;

