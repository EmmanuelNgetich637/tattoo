const express = require("express");

const adminDashboardController = require(
  "../controllers/adminDashboardController"
);

const authenticateAdmin = require(
  "../middleware/adminAuthMiddleware"
);

const router = express.Router();

router.get(
  "/stats",
  authenticateAdmin,
  adminDashboardController.getStats
);

router.get(
  "/recent-bookings",
  authenticateAdmin,
  adminDashboardController.getRecentBookings
);

router.get(
  "/bookings/:id",
  authenticateAdmin,
  adminDashboardController.getBooking
);

router.patch(
  "/bookings/:id/status",
  authenticateAdmin,
  adminDashboardController.updateBookingStatus
);

module.exports = router;