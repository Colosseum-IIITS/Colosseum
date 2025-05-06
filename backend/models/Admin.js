const mongoose = require('mongoose');

const adminSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true }
}, { timestamps: true });

// Keep only compound index (not duplicated)
adminSchema.index({ username: 1, email: 1 });

const Admin = mongoose.model('Admin', adminSchema);
module.exports = Admin;
