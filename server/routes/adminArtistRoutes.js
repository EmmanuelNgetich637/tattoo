const express = require("express");

const adminArtistController =
  require("../controllers/adminArtistController");

const authenticateAdmin =
  require("../middleware/adminAuthMiddleware");

const router = express.Router();

router.get(
  "/",
  authenticateAdmin,
  adminArtistController.getArtists
);

router.post(
  "/",
  authenticateAdmin,
  adminArtistController.createArtist
);

router.patch(
  "/:id",
  authenticateAdmin,
  adminArtistController.updateArtist
);

router.delete(
  "/:id",
  authenticateAdmin,
  adminArtistController.deleteArtist
);

module.exports = router;
