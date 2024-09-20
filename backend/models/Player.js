const mongoose = require('mongoose');

const playerSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  profilePhoto: { type: String },
  team: { type: mongoose.Schema.Types.ObjectId, ref: 'Team' },
  following: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Organiser'}],
  tournaments: [{
    tournament: { type: mongoose.Schema.Types.ObjectId, ref: 'Tournament' },
    won: { type: Boolean, default: false }
  }],
  banned: { type: Boolean, default: false },
}, { timestamps: true });

const Player = mongoose.model('Player', playerSchema);
module.exports = Player;
