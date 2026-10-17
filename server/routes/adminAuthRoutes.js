const express = require("express");

const adminAuthController = require(
  "../controllers/adminAuthController"
);

const authenticateAdmin = require(
  "../middleware/adminAuthMiddleware"
);

const router = express.Router();

router.post(
  "/login",
  adminAuthController.login
);

router.get(
  "/me",
  authenticateAdmin,
  adminAuthController.me
);

module.exports = router;