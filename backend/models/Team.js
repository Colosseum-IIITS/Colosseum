const mongoose = require('mongoose');
const Tournament = require("../models/Tournament");
const Player = require("../models/Player");

const teamSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  logo: { type: String },
  players: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Player' }],
  captain: { type: mongoose.Schema.Types.ObjectId, ref: 'Player', required: true },
  tournaments: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Tournament' }], // Participated tournaments
  joinRequests: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Player' }], // New field to track join requests
}, { timestamps: true });

const Team = mongoose.model('Team', teamSchema);
module.exports = Team;
