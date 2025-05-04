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

// Add indexes for frequently queried fields
teamSchema.index({ name: 1 }); // For team name searches
teamSchema.index({ captain: 1 }); // For captain lookups
teamSchema.index({ players: 1 }); // For player membership queries
teamSchema.index({ tournaments: 1 }); // For tournament participation queries
teamSchema.index({ name: 'text' }); // Text index for search functionality
teamSchema.index({ captain: 1, players: 1 }); // Compound index for team membership checks

const Team = mongoose.model('Team', teamSchema);
module.exports = Team;
