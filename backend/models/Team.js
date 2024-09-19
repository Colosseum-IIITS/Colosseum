const mongoose = require('mongoose');

const teamSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },  // Unique team name
  logo: { type: String },  // Optional team logo
  players: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Player' }],  // List of players in the team
  captain: { type: mongoose.Schema.Types.ObjectId, ref: 'Player', required: true },  // Captain of the team
}, { timestamps: true });

const Team = mongoose.model('Team', teamSchema);
module.exports = Team;
