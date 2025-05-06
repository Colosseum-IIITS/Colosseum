const mongoose = require('mongoose');

const teamSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  logo: { type: String },
  players: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Player' }],
  captain: { type: mongoose.Schema.Types.ObjectId, ref: 'Player', required: true },
  tournaments: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Tournament' }],
  joinRequests: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Player' }],
}, { timestamps: true });

// Indexes
teamSchema.index({ name: 1 });
teamSchema.index({ captain: 1 });
teamSchema.index({ players: 1 });
teamSchema.index({ tournaments: 1 });
teamSchema.index({ name: 'text' });
teamSchema.index({ captain: 1, players: 1 });

const Team = mongoose.model('Team', teamSchema);
module.exports = Team;
