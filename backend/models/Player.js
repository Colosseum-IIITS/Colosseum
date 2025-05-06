const mongoose = require('mongoose');

const playerSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  profilePhoto: {
    data: String,
    contentType: String,
  },
  team: { type: mongoose.Schema.Types.ObjectId, ref: 'Team' },
  teamPayment: {
    paid: { type: Boolean, default: false },
    payment: { type: mongoose.Schema.Types.ObjectId, ref: 'Payment' }
  },
  following: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Organiser'}],
  tournaments: [{
    tournament: { type: mongoose.Schema.Types.ObjectId, ref: 'Tournament' },
    won: { type: Boolean, default: false },
    payment: { type: mongoose.Schema.Types.ObjectId, ref: 'Payment' }
  }],
  banned: { type: Boolean, default: false },
  notifications: [{
    message: { type: String },
    read: { type: Boolean, default: false },
    date: { type: Date, default: Date.now }
  }]
}, { timestamps: true });

playerSchema.virtual('tournamentsWon').get(function () {
  return this.tournaments.filter(t => t.won).length;
});

playerSchema.methods.canCreateTeam = function() {
  return this.teamPayment.paid === true;
};

// Indexes (skip duplicates)
playerSchema.index({ team: 1 });
playerSchema.index({ banned: 1 });
playerSchema.index({ 'tournaments.tournament': 1 });
playerSchema.index({ following: 1 });
playerSchema.index({ username: 'text' });
playerSchema.index({ 'tournaments.won': 1 });
playerSchema.index({ username: 1, banned: 1 });

const Player = mongoose.model('Player', playerSchema);
module.exports = Player;
