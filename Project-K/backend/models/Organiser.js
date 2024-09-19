const mongoose = require('mongoose');

const toSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  profilePhoto: { type: String },
  description: {type: String, default: "Hello World!!"},
  followers: { type: Number, default: 0 },
  tournamentsConducted: { type: Number, default: 0 },
  rating: { type: Number, default: 0 },
  tournaments: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Tournament' }],
  banned: { type: Boolean, default: false }  // New field to ban an organiser
}, { timestamps: true });

const Organiser = mongoose.model('Organiser', toSchema);
module.exports = Organiser;
