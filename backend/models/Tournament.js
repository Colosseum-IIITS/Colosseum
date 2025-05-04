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

// Add indexes for frequently queried fields
tournamentSchema.index({ tid: 1 }); // For tournament ID lookups
tournamentSchema.index({ name: 1 }); // For tournament name searches
tournamentSchema.index({ organiser: 1 }); // For organiser lookups
tournamentSchema.index({ status: 1 }); // For status filtering
tournamentSchema.index({ startDate: 1, endDate: 1 }); // For date range queries
tournamentSchema.index({ 'teams': 1 }); // For team participation queries
tournamentSchema.index({ name: 'text' }); // Text index for search functionality
tournamentSchema.index({ organiser: 1, status: 1 }); // Compound index for organiser's tournament status
tournamentSchema.index({ startDate: 1, endDate: 1, status: 1 }); // Compound index for active tournaments

const Tournament = mongoose.model("Tournament", tournamentSchema);
module.exports = Tournament;
