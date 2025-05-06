const Player = require('../../models/Player');
const Team = require('../../models/Team');
const Tournament = require('../../models/Tournament');
const Organiser = require('../../models/Organiser');

exports.getPublicStats = async (req, res) => {
  try {
    const totalPlayers = await Player.countDocuments({ banned: false });
    const totalTeams = await Team.countDocuments();
    const totalTournaments = await Tournament.countDocuments({ status: "Approved" });

    const ongoingTournaments = await Tournament.countDocuments({
      status: "Approved",
      startDate: { $lte: new Date() },
      endDate: { $gte: new Date() }
    });

    res.json({
      totalPlayers,
      totalTeams,
      totalTournaments,
      ongoingTournaments
    });
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
};

exports.getTournamentStatusBreakdown = async (req, res) => {
  try {
    const statusCounts = await Tournament.aggregate([
      { $group: { _id: "$status", count: { $sum: 1 } } }
    ]);
    res.json(statusCounts);
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
};

exports.getTopRatedOrganisersCount = async (req, res) => {
  try {
    const highRatedOrganisers = await Organiser.countDocuments({ rating: { $gte: 4.5 } });
    res.json({ highRatedOrganisers });
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
};

exports.getAvgPlayersPerTeam = async (req, res) => {
  try {
    const result = await Team.aggregate([
      { $project: { playerCount: { $size: "$players" } } },
      { $group: { _id: null, avgPlayers: { $avg: "$playerCount" } } }
    ]);
    res.json({ avgPlayersPerTeam: result[0]?.avgPlayers.toFixed(2) || 0 });
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
};
