const Tournament = require('../models/Tournament');

// Propose a new tournament
exports.proposeTournament = async (req, res) => {
  const { name, date, entryFee, prizePool, description } = req.body;

  try {
    const tournament = await Tournament.create({
      name,
      date,
      entryFee,
      prizePool,
      description,
      organizer: req.user._id,  // The organizer will be the logged-in user
    });

    res.status(201).json({
      message: 'Tournament proposed successfully',
      tournament,
    });
  } catch (error) {
    res.status(400).json({ message: 'Error proposing tournament', error });
  }
};

// Get all tournaments (optionally filter by status)
exports.getTournaments = async (req, res) => {
  const { status } = req.query;

  try {
    const query = status ? { status } : {};
    const tournaments = await Tournament.find(query).populate('organizer', 'username').populate('players', 'username');
    res.json(tournaments);
  } catch (error) {
    res.status(400).json({ message: 'Error fetching tournaments', error });
  }
};

// Update tournament status (Admin only)
exports.updateTournamentStatus = async (req, res) => {
  const { tournamentId } = req.params;
  const { status } = req.body;

  if (!['Pending', 'Approved', 'Completed'].includes(status)) {
    return res.status(400).json({ message: 'Invalid status' });
  }

  try {
    const tournament = await Tournament.findByIdAndUpdate(tournamentId, { status }, { new: true });
    if (!tournament) {
      return res.status(404).json({ message: 'Tournament not found' });
    }
    res.json({ message: 'Tournament status updated successfully', tournament });
  } catch (error) {
    res.status(400).json({ message: 'Error updating tournament status', error });
  }
};
