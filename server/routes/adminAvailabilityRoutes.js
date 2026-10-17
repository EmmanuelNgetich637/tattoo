const express = require("express");

const adminAvailabilityController =
  require(
    "../controllers/adminAvailabilityController"
  );

const authenticateAdmin =
  require(
    "../middleware/adminAuthMiddleware"
  );

const router =
  express.Router();


router.get(
  "/",
  authenticateAdmin,
  adminAvailabilityController.getAvailability
);


router.post(
  "/",
  authenticateAdmin,
  adminAvailabilityController.createAvailability
);


router.patch(
  "/:id",
  authenticateAdmin,
  adminAvailabilityController.updateAvailability
);


router.delete(
  "/:id",
  authenticateAdmin,
  adminAvailabilityController.deleteAvailability
);


module.exports = router;