const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const Payment = require('../models/Payment');
const Player = require('../models/Player');

exports.createPaymentIntent = async (req, res) => {
    try {
      const { amount, tournamentId, playerId, paymentType } = req.body;
  
      const paymentData = {
        player: playerId,
        amount,
        paymentType,
        stripePaymentId: 'pending'
      };
  
      // Add tournament reference only for tournament registrations
      if (paymentType === 'TOURNAMENT_REGISTRATION') {
        paymentData.tournament = tournamentId;
      }
  
      const paymentIntent = await stripe.paymentIntents.create({
        amount: amount * 100,
        currency: 'inr',
        metadata: {
          playerId,
          paymentType,
          ...(tournamentId && { tournamentId })
        }
      });
  
      // Update payment with Stripe payment ID
      paymentData.stripePaymentId = paymentIntent.id;
      const payment = await Payment.create(paymentData);
  
      res.json({
        clientSecret: paymentIntent.client_secret,
        paymentId: payment._id
      });
    } catch (error) {
      console.error('Payment error:', error);
      res.status(500).json({ error: 'Payment initialization failed' });
    }
  };

exports.confirmPayment = async (req, res) => {
  try {
    const { paymentId } = req.body;
    
    const payment = await Payment.findById(paymentId);
    if (!payment) {
      return res.status(404).json({ error: 'Payment not found' });
    }

    payment.status = 'completed';
    await payment.save();

    // Add notification to player
    await Player.findByIdAndUpdate(payment.player, {
      $push: {
        notifications: {
          message: `Payment of ₹${payment.amount} for tournament registration confirmed`,
          read: false
        }
      }
    });

    res.json({ message: 'Payment confirmed successfully' });
  } catch (error) {
    console.error('Payment confirmation error:', error);
    res.status(500).json({ error: 'Payment confirmation failed' });
  }
};