const mongoose = require('mongoose');
const Player = require('../models/Player');
const Team = require('../models/Team');
const Organiser = require('../models/Organiser');

const banHistorySchema = new mongoose.Schema({
  bannedEntity: {
    type: mongoose.Schema.Types.ObjectId,
    refPath: 'entityType',
    required: true,
  },
  entityType: {
    type: String,
    enum: ['Player', 'Team', 'Organiser'],
    required: true,
  },
  reason: { type: String, required: true },
  date: { type: Date, default: Date.now },
  active: { type: Boolean, default: true }
}, { timestamps: true });

banHistorySchema.index({ bannedEntity: 1, entityType: 1 });
banHistorySchema.index({ active: 1 });
banHistorySchema.index({ date: -1 });

const BanHistory = mongoose.model('BanHistory', banHistorySchema);
module.exports = BanHistory;
