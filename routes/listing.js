const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync.js");
const Listing = require("../models/listing.js");
const { isLoggedIn, isOwner, validateListing } = require("../middleware.js");
const listingController = require("../controllers/listings.js");

const multer = require("multer");
const { storage } = require("../cloudConfig.js");
const upload = multer({ storage });

// NEW ROUTE
router.get("/new", isLoggedIn, listingController.renderNewform);

router
  .route("/")
  // INDEX ROUTE
  .get(wrapAsync(listingController.index))
  .post(
    isLoggedIn,
    upload.single("listing[image]"),   // 1️⃣ pahle image upload
    validateListing,                   // 2️⃣ phir JOI validation
    wrapAsync(listingController.createListing)
  );

router
  .route("/:id")
  // SHOW ROUTE
  .get(wrapAsync(listingController.showListing))
  // DELETE ROUTE
  .delete(
    isLoggedIn,
    isOwner,
    wrapAsync(listingController.destroyListing)
  )
  // UPDATE ROUTE
  .put(
    isLoggedIn,
    isOwner,
    upload.single("listing[image]"),   // 1️⃣ pahle upload
    validateListing,                   // 2️⃣ phir validate
    wrapAsync(listingController.updateListing)
  );

// EDIT ROUTE
router.get(
  "/:id/edit",
  isLoggedIn,
  isOwner,
  wrapAsync(listingController.renderEditForm)
);

module.exports = router;
