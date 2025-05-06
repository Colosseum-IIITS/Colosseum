const Organiser = require('../../models/Organiser');
const Tournament = require('../../models/Tournament');
const Player = require('../../models/Player');
const Team = require('../../models/Team');

exports.getBusinessStats = async (req, res) => {
  try {
    const totalOrganisers = await Organiser.countDocuments({ banned: false });
    const bannedOrganisers = await Organiser.countDocuments({ banned: true });

    const totalRevenue = await Tournament.aggregate([
      { $group: { _id: null, total: { $sum: "$revenue" } } }
    ]);

    const totalTournaments = await Tournament.countDocuments();
    const bannedPlayers = await Player.countDocuments({ banned: true });

    res.json({
      totalOrganisers,
      bannedOrganisers,
      totalRevenue: totalRevenue[0]?.total || 0,
      totalTournaments,
      bannedPlayers
    });
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
};

exports.getAverageRevenuePerTournament = async (req, res) => {
  try {
    const result = await Tournament.aggregate([
      { $group: { _id: null, avgRevenue: { $avg: "$revenue" } } }
    ]);
    res.json({ avgRevenue: result[0]?.avgRevenue.toFixed(2) || 0 });
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
};

exports.getTotalTeamJoins = async (req, res) => {
  try {
    const result = await Team.aggregate([
      { $group: { _id: null, totalJoins: { $sum: { $size: "$players" } } } }
    ]);
    res.json({ totalTeamJoins: result[0]?.totalJoins || 0 });
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
};

exports.getTournamentGrowthOverTime = async (req, res) => {
  try {
    const monthlyGrowth = await Tournament.aggregate([
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m", date: "$createdAt" } },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);
    res.json(monthlyGrowth);
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
};
