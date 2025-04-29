
const mongoose = require('mongoose');
const Player = require('../models/Player');  // Import Player model
const Team = require('../models/Team');      // Import Team model
const Organiser = require('../models/Organiser');  // Import Organiser model

const banHistorySchema = new mongoose.Schema({
  bannedEntity: {
    type: mongoose.Schema.Types.ObjectId,
    refPath: 'entityType',  // Dynamically reference Player, Team, or Organiser
    required: true,
  },
  entityType: {
    type: String,
    enum: ['Player', 'Team', 'Organiser'],
    required: true,
  },
  reason: { 
    type: String, 
    required: true 
  },
  date: { 
    type: Date, 
    default: Date.now 
  },
  active: { 
    type: Boolean, 
    default: true 
  },
}, { timestamps: true });

// Add indexes for ban history lookups
banHistorySchema.index({ bannedEntity: 1, entityType: 1 }); // Compound index for looking up by entity
banHistorySchema.index({ active: 1 }); // For quickly finding active bans
banHistorySchema.index({ date: -1 }); // For sorting by most recent

const BanHistory = mongoose.model('BanHistory', banHistorySchema);
module.exports = BanHistory;
