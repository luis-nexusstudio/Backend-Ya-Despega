const express = require('express');
const router = express.Router();
const firebaseAuth = require('../middleware/auth');
const { handleGetEventDetails } = require('../controllers/events-controller');

router.get('/event-details/:eventId', firebaseAuth, handleGetEventDetails);

module.exports = router;