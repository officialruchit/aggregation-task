const express = require("express");
const router = express.Router();
const listingController = require("../controllers/accomdationController");
router.get("/", listingController.calculateday);
module.exports = router;
