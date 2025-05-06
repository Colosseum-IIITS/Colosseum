const mongoose = require("mongoose");

const reportSchema = new mongoose.Schema(
  {
    reportedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Player",
      required: true,
    },
    reportType: { 
      type: String, 
      enum: ["Team", "Organiser"], 
      required: true 
    },
    reportedTeam: { 
      type: String, 
      required: function() { return this.reportType === 'Team'; }
    },
    reportedOrganiser: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "Organiser",
      required: function() { return this.reportType === 'Organiser'; }
    },
    reason: { 
      type: String, 
      required: true 
    },
    status: { 
      type: String, 
      enum: ["Pending", "Reviewed"], 
      default: "Pending" 
    },
  },
  { timestamps: true }
);

// Indexes
reportSchema.index({ reportedBy: 1 });
reportSchema.index({ reportType: 1 });
reportSchema.index({ status: 1 });
reportSchema.index({ createdAt: 1 });
reportSchema.index({ reportType: 1, status: 1 });
reportSchema.index({ reportedBy: 1, reportType: 1 });

const Report = mongoose.model("Report", reportSchema);
module.exports = Report;
