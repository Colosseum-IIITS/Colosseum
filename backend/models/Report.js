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

// Add indexes for frequently queried fields
reportSchema.index({ reportedBy: 1 }); // For reporter lookups
reportSchema.index({ reportType: 1 }); // For report type filtering
reportSchema.index({ status: 1 }); // For status filtering
reportSchema.index({ createdAt: 1 }); // For date-based queries
reportSchema.index({ reportType: 1, status: 1 }); // Compound index for report filtering
reportSchema.index({ reportedBy: 1, reportType: 1 }); // Compound index for user reports

const Report = mongoose.model("Report", reportSchema);
module.exports = Report;
