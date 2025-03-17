const mongoose = require('mongoose');

const playerSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  profilePhoto: {
    data: String, // Base64 string
    contentType: String, // MIME type
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

// Virtual field for tournaments won
playerSchema.virtual('tournamentsWon').get(function () {
  return this.tournaments.filter(t => t.won).length;
});

// Method to check if a player can create a team
playerSchema.methods.canCreateTeam = function() {
  return this.teamPayment.paid === true;
};

const Player = mongoose.model('Player', playerSchema);

module.exports = Player;
