const mongoose = require("mongoose");
const reportSchema = new mongoose.Schema(
  {
    reportedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Player",
      required: true,
    },
    reportType: { type: String, enum: ["Team", "Organiser"], required: true },
    reportedTeam: { type: mongoose.Schema.Types.ObjectId, ref: "Team" },
    organiser: { type: mongoose.Schema.Types.ObjectId, ref: "Organiser" },
    reason: { type: String, required: true },
    status: { type: String, enum: ["Pending", "Reviewed"], default: "Pending" },
  },
  { timestamps: true }
);
const Report = mongoose.model("Report", reportSchema);
module.exports = Report;
