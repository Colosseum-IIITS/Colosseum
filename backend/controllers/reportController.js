const Report = require('../models/Report');
const Player = require('../models/Player');
const Team = require('../models/Team');
const Organiser = require('../models/Organiser');

exports.reportTeam = async (req, res) => {
  const { reportedTeam, organiser, tournament, reason, playerId } = req.body;

  try {
    const player = await Player.findById(playerId);
    if (!player) {
      return res.status(404).json({ message: 'Player not found' });
    }

    const team = await Team.findById(reportedTeam);
    if (!team) {
      return res.status(404).json({ message: 'Team not found' });
    }

    const organiserData = await Organiser.findById(organiser);
    if (!organiserData) {
      return res.status(404).json({ message: 'Organiser not found' });
    }

    const report = new Report({
      reportedBy: playerId,
      reportedTeam,
      organiser,
      tournament,
      reason,
    });

    await report.save();
    res.status(201).json({ message: 'Report submitted successfully', report });
  } catch (error) {
    console.error('Error reporting team:', error);
    res.status(500).json({ error: 'Error reporting team', details: error.message });
  }
};