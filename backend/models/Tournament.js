const mongoose = require("mongoose");

const tournamentSchema = new mongoose.Schema(
  {
    tid: { type: String, required: true },
    name: { type: String, required: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    entryFee: { type: Number, default: 0 },
    prizePool: { type: Number, default: 0 },
    revenue: { type: Number, default: 0 },
    status: {
      type: String,
      enum: ["Pending", "Approved", "Completed"],
      default: "Pending",
    },
    organiser: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Organiser",
      required: true,
    },
    teams: [{ type: mongoose.Schema.Types.ObjectId, ref: "Team" }],
    description: { type: String, default: "Hello World!!" },
    winner: { 
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Team'
    },
    winningDetails: {
      prizeAmount: Number,
      winningDate: Date
    },
    pointsTable: [
      {
        ranking: Number,
        teamName: String,
        totalPoints: Number,
      },
    ],
  },
  { timestamps: true }
);

// Indexes
tournamentSchema.index({ tid: 1 });
tournamentSchema.index({ name: 1 });
tournamentSchema.index({ name: 'text' });
tournamentSchema.index({ organiser: 1 });
tournamentSchema.index({ status: 1 });
tournamentSchema.index({ startDate: 1, endDate: 1 });
tournamentSchema.index({ teams: 1 });
tournamentSchema.index({ organiser: 1, status: 1 });
tournamentSchema.index({ startDate: 1, endDate: 1, status: 1 });

const Tournament = mongoose.model("Tournament", tournamentSchema);
module.exports = Tournament;
