const mongoose = require('mongoose');

const playerSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  profilePhoto: { type: String },
  teamName: { type: String },
  teamLogo: { type: String },
  following: { type: String},
  tournamentsPlayed: { type: Number, default: 0 },
  rankings: [{type: Number}],
  tournamentsWon: { type: Number, default: 0 },
  banned: { type: Boolean, default: false }  // New field to ban a player
}, { timestamps: true });

const Player = mongoose.model('Player', playerSchema);
module.exports = Player;
