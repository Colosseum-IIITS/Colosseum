const mongoose = require("mongoose");
const Organiser = require("../models/Organiser");

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
  { 
    timestamps: true
  }
);

// Compound index on status and tid for faster filtering
tournamentSchema.index({ status: 1, tid: 1 });
// Text index on name to support text search
tournamentSchema.index({ name: 'text' });

const Tournament = mongoose.model("Tournament", tournamentSchema);
module.exports = Tournament;
