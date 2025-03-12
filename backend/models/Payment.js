const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  player: { type: mongoose.Schema.Types.ObjectId, ref: 'Player' },
  amount: { type: Number, required: true },
  type: { type: String, enum: ['TEAM_CREATION'], required: true },
  status: { type: String, enum: ['pending', 'completed'], default: 'pending' },
  stripePaymentId: { type: String },
}, { timestamps: true });

const Payment = mongoose.model('Payment', paymentSchema);
module.exports = Payment;