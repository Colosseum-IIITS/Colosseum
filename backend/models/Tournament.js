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
    winner: { type: String },
    // messageBox: [{type: String}],
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

const Tournament = mongoose.model("Tournament", tournamentSchema);
module.exports = Tournament;
