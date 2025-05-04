const mongoose = require('mongoose');

const adminSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true }
}, { timestamps: true });

// Add indexes for frequently queried fields
adminSchema.index({ username: 1 }); // Single index for username lookups
adminSchema.index({ email: 1 }); // Single index for email lookups
adminSchema.index({ username: 1, email: 1 }); // Compound index for queries that use both

const Admin = mongoose.model('Admin', adminSchema);
module.exports = Admin;
