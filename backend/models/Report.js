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

// Add indexes for report filtering and searching
reportSchema.index({ reportedBy: 1 }); // Find reports by reporter
reportSchema.index({ reportType: 1 }); // Filter by type of report
reportSchema.index({ status: 1 }); // Filter by status
reportSchema.index({ reportedOrganiser: 1 }); // Find reports against specific organiser
reportSchema.index({ createdAt: -1 }); // For sorting by most recent

const Report = mongoose.model("Report", reportSchema);
module.exports = Report;
