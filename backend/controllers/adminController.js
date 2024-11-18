const Organiser = require('../models/Organiser');
const Player = require('../models/Player');
const Tournament = require('../models/Tournament');
const Team = require('../models/Team');

// Ban an organiser
exports.banOrganiser = async (req, res) => {
    try {
      await Organiser.findByIdAndUpdate(req.params.id, { banned: true });
      res.redirect('/admin/dashboard');
    } catch (error) {
      res.status(400).json({ error });
    }
  };
  
  // Unban an organiser
  exports.unBanOrganiser = async (req, res) => {
    try {
      await Organiser.findByIdAndUpdate(req.params.id, { banned: false });
      res.redirect('/admin/dashboard');
    } catch (error) {
      res.status(400).json({ error });
    }
  };
  
  // Delete an organiser
  exports.deleteOrganiser = async (req, res) => {
    try {
      await Organiser.findByIdAndDelete(req.params.id);
      res.redirect('/admin/dashboard');
    } catch (error) {
      res.status(400).json({ error });
    }
  };
  
  // Ban a player
  exports.banPlayer = async (req, res) => {
    try {
      await Player.findByIdAndUpdate(req.params.id, { banned: true });
      res.redirect('/admin/dashboard');
    } catch (error) {
      res.status(400).json({ error });
    }
  };
  
  // Unban a player
  exports.unBanPlayer = async (req, res) => {
    try {
      await Player.findByIdAndUpdate(req.params.id, { banned: false });
      res.redirect('/admin/dashboard');
    } catch (error) {
      res.status(400).json({ error });
    }
  };
  
  // Delete a player
  exports.deletePlayer = async (req, res) => {
    try {
      await Player.findByIdAndDelete(req.params.id);
      res.redirect('/admin/dashboard');
    } catch (error) {
      res.status(400).json({ error });
    }
  };
  

// Approve a tournament
exports.approveTournament = async (req, res) => {
  try {
    const tournament = await Tournament.findByIdAndUpdate(req.params.id, { status: 'Approved' });
    res.redirect('/admin/dashboard');
  } catch (error) {
    res.status(400).json({ error });
  }
};


  // Fetch reports (for admin)
  exports.fetchOrganiserReportsForAdmin = async (req, res) => {
    try {
      const reports = await Report.find().populate('reportedBy organiser');
      res.status(200).json(reports);
    } catch (error) {
      res.status(500).json({ error: 'Error fetching reports', details: error.message });
    }
  };

  // Render the admin dashboard
  exports.getDashboard = async (req, res) => {
    try {
      const organisers = await Organiser.find();
      const players = await Player.find();
      const tournaments = await Tournament.find();
      const totalTeams = await Team.countDocuments();
      const totalBannedPlayers = await Player.countDocuments({ banned: true });
      const totalTournamentsConducted = organisers.reduce((acc, organiser) => acc + organiser.tournamentsConducted, 0);
      const totalBannedOrgs = await Organiser.countDocuments({ banned: true });
  
      const currentDate = new Date();
      const ongoingTournamentsCount = await Tournament.countDocuments({
        startDate: { $lte: currentDate },
        endDate: { $gte: currentDate }
      });
      const pendingTournamentsCount = await Tournament.countDocuments({ status: 'Pending' });
      const tournamentToBeApproved = await Tournament.find({ status: 'Pending' }).populate('organiser');
  
      // Calculate player stats
      const playersWithStats = await Promise.all(players.map(async (player) => {
        const totalTournamentsPlayed = player.tournaments.length;
        const totalWins = player.tournaments.filter(t => t.won).length;
        const winPercentage = totalTournamentsPlayed > 0 ? (totalWins / totalTournamentsPlayed) * 100 : 0;
        const totalTournamentsWon = totalWins; // Assuming achievements are equivalent to wins for simplicity
  
        return {
          ...player._doc, // Spread the existing player fields
          totalTournamentsPlayed,
          winPercentage: winPercentage.toFixed(2),
          totalTournamentsWon
        };
      }));
  
      res.render('adminDashboard', {
        organisers,
        players: playersWithStats, // Pass the enriched players with stats
        tournaments,
        totalTeams,
        totalBannedPlayers,
        totalTournamentsConducted,
        totalBannedOrgs,
        ongoingTournamentsCount,
        pendingTournamentsCount,
        tournamentToBeApproved
      });
    } catch (error) {
      console.error(error);
      res.status(500).render('error', { statusCode: '500', errorMessage: 'Error Fetching data from dashboard' });
    }
  };
  
  
