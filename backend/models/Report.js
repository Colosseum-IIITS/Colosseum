const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema({
  reportedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Player', required: true },  // Player making the report
  reportedTeam: { type: mongoose.Schema.Types.ObjectId, ref: 'Team', required: true },  // The team being reported
  organiser: { type: mongoose.Schema.Types.ObjectId, ref: 'Organiser', required: true },  // Organiser handling the report
  tournament: { type: mongoose.Schema.Types.ObjectId, ref: 'Tournament', required: true },  // Tournament where the issue happened
  reason: { type: String, required: true },  // Reason for reporting the team
  status: { type: String, enum: ['Pending', 'Reviewed'], default: 'Pending' },  // Report status
}, { timestamps: true });

const Report = mongoose.model('Report', reportSchema);
module.exports = Report;
