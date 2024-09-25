const Tournament = require("../models/Tournament");
const Player = require("../models/Player");
const Team = require("../models/Team");
const { findOneAndUpdate } = require("../models/Organiser");

// Create a new tournament
//working
exports.createTournament = async (req, res) => {
  const {
    tid,
    name,
    startDate,
    endDate,
    entryFee,
    prizePool,
    organizer,
    description,
  } = req.body;
  const {_id}=req.user;

  try {
    // Check if tournament ID is unique
    const existingTournament = await Tournament.findOne({ tid });
    if (existingTournament) {
      return res.status(400).json({ message: "Tournament ID already exists" });
    }

    // Create a new tournament
    const tournament = new Tournament({
      tid,
      name,
      startDate,
      endDate,
      entryFee,
      prizePool,
      status: "Pending", // Initially setting the tournament status to 'Pending'
      organizer,
      description,
    });

    await tournament.save();
    res
      .status(201)
      .json({ message: "Tournament created successfully", tournament });
  } catch (error) {
    res.status(500).json({ error: "Error creating tournament" });
  }
};

// Update an existing tournament
exports.updateTournament = async (req, res) => {
  const { tournamentId } = req.params; // Tournament ID from the URL params
  const updateData = req.body; // Data from the request body to update the tournament

  try {
    // Find the tournament by its ID and update it
    const tournament = await Tournament.findByIdAndUpdate(
      tournamentId,
      updateData,
      { new: true }
    );

    if (!tournament) {
      return res.status(404).json({ message: "Tournament not found" });
    }

    res
      .status(200)
      .json({ message: "Tournament updated successfully", tournament });
  } catch (error) {
    res.status(500).json({ error: "Error updating tournament" });
  }
};

// Update Winner
exports.updateWinner = async (req, res) => {
  const { tournamentId, winnerId } = req.body;

 try {
    // Find the tournament by ID
    const tournament = await Tournament.findById(tournamentId);
    if (!tournament) {
      return res.status(404).json({ message: "Tournament not found" });
    }

    // Check if the requester is the organizer
    if (!tournament.organizer.equals(req.user.id)) {
      return res
        .status(403)
        .json({ message: "Only the organizer can update the winner" });
    }

    // Update the winner in the tournament
    tournament.winner = winnerId;
    await tournament.save();

    // Update the player's tournament won status
    const player = await Player.findById(winnerId);
    if (!player) {
      return res.status(404).json({ message: "Player not found" });
    }

    const tournamentIndex = player.tournaments.findIndex((t) =>
      t.tournament.equals(tournamentId)
    );
    if (tournamentIndex !== -1) {
      player.tournaments[tournamentIndex].won = true;
      await player.save();
    }

    res
      .status(200)
      .json({ message: "Winner updated successfully", tournament });
  } catch (error) {
    console.error("Error updating winner:", error);
    res.status(500).json({ error: "Error updating winner" });
  }
};
