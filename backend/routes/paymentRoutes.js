const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');
const { authenticateUser } = require('../middleware/authMiddleware');

router.post('/create-payment-intent', authenticateUser, paymentController.createPaymentIntent);
router.post('/confirm-payment', authenticateUser, paymentController.confirmPayment);

module.exports = router;