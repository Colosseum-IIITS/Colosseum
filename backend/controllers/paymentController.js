const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const Payment = require('../models/Payment');
const Player = require('../models/Player');
const { delCache } = require('../utils/redisClient'); // Update path as needed

// STEP 1: Create payment intent
exports.createPaymentIntent = async (req, res) => {
  try {
    const { amount } = req.body;
    const playerId = req.user._id;

    // Create payment intent on Stripe
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount * 100, // Convert to cents
      currency: 'inr',
      metadata: {
        playerId: playerId.toString(),
        type: 'TEAM_CREATION'
      }
    });

    // Save a new payment document in DB
    const payment = new Payment({
      player: playerId,
      amount,
      type: 'TEAM_CREATION', // Use this as an identifier if needed
      stripePaymentId: paymentIntent.id
    });
    await payment.save();

    res.json({ clientSecret: paymentIntent.client_secret });

  } catch (error) {
    console.error('Payment Intent Error:', error);
    res.status(500).json({ error: 'Error creating payment' });
  }
};

// STEP 2: Confirm payment after successful Stripe transaction
exports.confirmPayment = async (req, res) => {
  try {
    const { paymentIntentId } = req.body;
    const playerId = req.user._id;

    // Retrieve and verify payment intent from Stripe
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
    if (paymentIntent.status !== 'succeeded') {
      return res.status(400).json({ error: 'Payment not successful' });
    }

    // Find and update payment record
    const payment = await Payment.findOne({ stripePaymentId: paymentIntentId });
    if (!payment) {
      return res.status(404).json({ error: 'Payment not found' });
    }

    payment.status = 'completed';
    await payment.save();

    // Update player with payment status
    const player = await Player.findById(playerId);
    player.teamPayment = {
      paid: true,
      payment: payment._id
    };
    await player.save();

    // ✅ Invalidate cached profile
    const cacheKey = `player_profile_${playerId}`;
    await delCache(cacheKey);

    res.json({ success: true });

  } catch (error) {
    console.error('Payment Confirmation Error:', error);
    res.status(500).json({ error: 'Error confirming payment' });
  }
};
