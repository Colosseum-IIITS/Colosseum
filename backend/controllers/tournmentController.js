const Tournament = require('../models/Tournament');

// Create a new tournament
exports.createTournament = async (req, res) => {
  const { tid, name, startDate, endDate, entryFee, prizePool, organizer, description } = req.body;

  try {
    // Check if tournament ID is unique
    const existingTournament = await Tournament.findOne({ tid });
    if (existingTournament) {
      return res.status(400).json({ message: 'Tournament ID already exists' });
    }

    // Create a new tournament
    const tournament = new Tournament({
      tid,
      name,
      startDate,
      endDate,
      entryFee,
      prizePool,
      status: 'Pending',  // Initially setting the tournament status to 'Pending'
      organizer,
      description
    });

    await tournament.save();
    res.status(201).json({ message: 'Tournament created successfully', tournament });
  } catch (error) {
    res.status(500).json({ error: 'Error creating tournament' });
  }
};

// Update an existing tournament
exports.updateTournament = async (req, res) => {
  const { tournamentId } = req.params;  // Tournament ID from the URL params
  const updateData = req.body;  // Data from the request body to update the tournament

  try {
    // Find the tournament by its ID and update it
    const tournament = await Tournament.findByIdAndUpdate(tournamentId, updateData, { new: true });

    if (!tournament) {
      return res.status(404).json({ message: 'Tournament not found' });
    }

    res.status(200).json({ message: 'Tournament updated successfully', tournament });
  } catch (error) {
    res.status(500).json({ error: 'Error updating tournament' });
  }
};
