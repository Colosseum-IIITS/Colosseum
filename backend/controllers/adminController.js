const Organiser = require('../models/Organiser');
const Player = require('../models/Player');
const Tournament = require('../models/Tournament');
const Team = require('../models/Team');
const Report = require('../models/Report');

// Ban an organiser
exports.banOrganiser = async (req, res) => {
    try {
        await Organiser.findByIdAndUpdate(req.params.id, { banned: true });
        res.status(200).json({ message: 'Organiser banned successfully.' });
    } catch (error) {
        res.status(400).json({ error: 'Error banning organiser', details: error.message });
    }
};

// Unban an organiser
exports.unBanOrganiser = async (req, res) => {
    try {
        await Organiser.findByIdAndUpdate(req.params.id, { banned: false });
        res.status(200).json({ message: 'Organiser unbanned successfully.' });
    } catch (error) {
        res.status(400).json({ error: 'Error unbanning organiser', details: error.message });
    }
};

// Delete an organiser
exports.deleteOrganiser = async (req, res) => {
    try {
        await Organiser.findByIdAndDelete(req.params.id);
        res.status(200).json({ message: 'Organiser deleted successfully.' });
    } catch (error) {
        res.status(400).json({ error: 'Error deleting organiser', details: error.message });
    }
};

// Ban a player
exports.banPlayer = async (req, res) => {
    try {
        await Player.findByIdAndUpdate(req.params.id, { banned: true });
        res.status(200).json({ message: 'Player banned successfully.' });
    } catch (error) {
        res.status(400).json({ error: 'Error banning player', details: error.message });
    }
};

// Unban a player
exports.unBanPlayer = async (req, res) => {
    try {
        await Player.findByIdAndUpdate(req.params.id, { banned: false });
        res.status(200).json({ message: 'Player unbanned successfully.' });
    } catch (error) {
        res.status(400).json({ error: 'Error unbanning player', details: error.message });
    }
};

// Delete a player
exports.deletePlayer = async (req, res) => {
    try {
        await Player.findByIdAndDelete(req.params.id);
        res.status(200).json({ message: 'Player deleted successfully.' });
    } catch (error) {
        res.status(400).json({ error: 'Error deleting player', details: error.message });
    }
};

// Approve a tournament
exports.approveTournament = async (req, res) => {
    try {
        await Tournament.findByIdAndUpdate(req.params.id, { status: 'Approved' });
        res.status(200).json({ message: 'Tournament approved successfully.' });
    } catch (error) {
        res.status(400).json({ error: 'Error approving tournament', details: error.message });
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
        const activeTournamentsCount = await Tournament.countDocuments({
             startDate: { $lte: currentDate },
             endDate: { $gte: currentDate },
             status: 'Approved' // Only count approved tournaments
          });

        const completedTournamentsCount = await Tournament.countDocuments({
            endDate: { $lte: currentDate },
            status: 'Completed'
          });

        // Calculate player stats
        const playersWithStats = await Promise.all(players.map(async (player) => {
            const totalTournamentsPlayed = player.tournaments.length;
            const totalWins = player.tournaments.filter(t => t.won).length;
            const winPercentage = totalTournamentsPlayed > 0 ? (totalWins / totalTournamentsPlayed) * 100 : 0;
            const totalTournamentsWon = totalWins;

            return {
                ...player._doc, // Spread the existing player fields
                totalTournamentsPlayed,
                winPercentage: winPercentage.toFixed(2),
                totalTournamentsWon
            };
        }));

        const reports = await Report.find({ reportType: 'Organiser' })
            .populate('reportedBy')
            .populate('reportedOrganiser');

        res.status(200).json({
            organisers,
            players: playersWithStats,
            tournaments,
            totalTeams,
            activeTournamentsCount,
            completedTournamentsCount,
            totalBannedPlayers,
            totalTournamentsConducted,
            totalBannedOrgs,
            ongoingTournamentsCount,
            pendingTournamentsCount,
            tournamentToBeApproved,
            reports
        });
    } catch (error) {
        res.status(500).json({ error: 'Error fetching dashboard data', details: error.message });
    }
};
