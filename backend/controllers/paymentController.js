const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const Payment = require('../models/Payment');
const Player = require('../models/Player');

exports.createPaymentIntent = async (req, res) => {
  try {
    const { amount } = req.body;
    const playerId = req.user._id;

    // Create payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount * 100, // Convert to cents
      currency: 'inr',
      metadata: {
        playerId: playerId.toString(),
        type: 'TEAM_CREATION'
      }
    });

    // Create payment record
    const payment = new Payment({
      player: playerId,
      amount,
      type: 'TEAM_CREATION',
      stripePaymentId: paymentIntent.id
    });
    await payment.save();

    res.json({ 
      clientSecret: paymentIntent.client_secret 
    });
  } catch (error) {
    console.error('Payment Intent Error:', error);
    res.status(500).json({ error: 'Error creating payment' });
  }
};

exports.confirmPayment = async (req, res) => {
  try {
    const { paymentIntentId } = req.body;
    const playerId = req.user._id;

    // Verify payment with Stripe
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
    
    if (paymentIntent.status !== 'succeeded') {
      return res.status(400).json({ error: 'Payment not successful' });
    }

    // Update payment record
    const payment = await Payment.findOne({ stripePaymentId: paymentIntentId });
    if (!payment) {
      return res.status(404).json({ error: 'Payment not found' });
    }

    payment.status = 'completed';
    await payment.save();

    // Update player's payment status
    const player = await Player.findById(playerId);
    player.teamPayment = {
      paid: true,
      payment: payment._id
    };
    await player.save();

    res.json({ success: true });
  } catch (error) {
    console.error('Payment Confirmation Error:', error);
    res.status(500).json({ error: 'Error confirming payment' });
  }
};