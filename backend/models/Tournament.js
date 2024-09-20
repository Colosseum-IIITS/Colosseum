const mongoose = require('mongoose');

const tournamentSchema = new mongoose.Schema({
  tid: { type: String, required: true},
  name: { type: String, required: true }, 
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  entryFee: { type: Number, default: 0 },
  prizePool: { type: Number, default: 0 },
  status: { type: String, enum: ['Pending', 'Approved', 'Completed'], default: 'Pending' },
  organizer: { type: mongoose.Schema.Types.ObjectId, ref: 'Organiser', required: true },
  players: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Player' }],
  pointsTable: [{ ranking: Number, teamName: String, placementPoints: Number, finishPoints: Number ,totalPoints: Number }],
  description: { type: String , default: "Hello World!!" },
  winner: {type: String},
  // messageBox: [{type: String}],
}, { timestamps: true });

const Tournament = mongoose.model('Tournament', tournamentSchema);
module.exports = Tournament;
