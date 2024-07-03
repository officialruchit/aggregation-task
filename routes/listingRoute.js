const express = require('express');
const router = express.Router();

const listingController = require('../controllers/listingController');

router.get('/', listingController.listingData);
router.get('/searchName', listingController.searchByName);

module.exports = router;
