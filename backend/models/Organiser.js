const mongoose = require("mongoose");

const toSchema = new mongoose.Schema(
  {
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    profilePhoto: { type: String },
    description: { type: String, default: "Hello World!!" },
    followers: [{ type: mongoose.Schema.Types.ObjectId, ref: "Player" }],
    tournamentsConducted: { type: Number, default: 0 },
    rating: { type: Number, default: 0 },
    tournaments: [{ type: mongoose.Schema.Types.ObjectId, ref: "Tournament" }],
    bannedTeams: [{ type: mongoose.Schema.Types.ObjectId, ref: "Player" }], 
    totalRevenue: { type: Number, default: 0 },
    banned: { type: Boolean, default: false },
    visibilitySettings: {
      descriptionVisible: { type: Boolean, default: true },
      profilePhotoVisible: { type: Boolean, default: true },
      prizePoolVisible: { type: Boolean, default: true },
      tournamentsVisible: { type: Boolean, default: true },
      followersVisible: { type: Boolean, default: true },
    },
  }, 
  { timestamps: true }
);

// Add indexes for faster queries
toSchema.index({ username: 1 }); // For username lookups
toSchema.index({ email: 1 }); // For email lookups
toSchema.index({ tournaments: 1 }); // For tournament queries
toSchema.index({ followers: 1 }); // For follower queries
toSchema.index({ banned: 1 }); // For ban status checks
toSchema.index({ username: 'text' }); // Text index for search functionality
toSchema.index({ username: 1, banned: 1 }); // Compound index for organiser status checks
toSchema.index({ tournaments: 1, banned: 1 }); // Compound index for active organisers

const Organiser = mongoose.model("Organiser", toSchema);
module.exports = Organiser;
