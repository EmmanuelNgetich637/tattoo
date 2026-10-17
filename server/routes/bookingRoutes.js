const express = require("express");

const bookingController = require(
  "../controllers/bookingController"
);

const upload = require(
  "../middleware/uploadMiddleware"
);

const router = express.Router();

router.post(
  "/",
  upload.array("referenceImages", 5),
  bookingController.createBooking
);

module.exports = router;