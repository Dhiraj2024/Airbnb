const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync.js");
const Listing = require("../models/listing.js");
const { isLoggedIn, isOwner ,validateListing}= require("../middleware.js");
const listingController = require("../controllers/listings.js");

const multer = require('multer');
const {storage } = require("../cloudConfig.js");
const upload = multer({ storage });



//new route---
router.get("/new",isLoggedIn,listingController.renderNewform);



router
.route("/")
//Index route--------
.get(wrapAsync(listingController.index))
     .post(
      isLoggedIn,
  
   upload.single("listing[image]") ,
    validateListing,
  
   wrapAsync(listingController.createListing)
  );
  

router
.route("/:id")
//show route---------
.get( wrapAsync(listingController.showListing))
//Delete Route
.delete(
  isLoggedIn,
  isOwner,
  wrapAsync(listingController.destroyListing))
//Update Route
.put(
  isLoggedIn,
  isOwner,
 upload.single("listing[image]") ,
  validateListing,
  wrapAsync(listingController.updateListing));


//Edit Route
router.get("/:id/edit",
  isLoggedIn, 
  isOwner,
  wrapAsync(listingController.renderEditForm));

module.exports = router;
