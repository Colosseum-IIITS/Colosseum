const Organiser = require('../models/Organiser');
const Player = require('../models/Player');
const Tournament = require('../models/Tournament');
const Team = require('../models/Team');
const Report = require('../models/Report');
const BanHistory = require('../models/BanHistory');

// Ban an organiser and create BanHistory entry
exports.banOrganiser = async (req, res) => {
    try {
        const organiser = await Organiser.findById(req.params.id);
        if (!organiser) {
            return res.status(404).json({ error: 'Organiser not found' });
        }
        await Organiser.findByIdAndUpdate(req.params.id, { banned: true });

        // Create BanHistory entry
        const banHistory = new BanHistory({
            bannedEntity: organiser._id,
            entityType: 'Organiser',
            reason: req.body.reason,  // Assume reason is passed in the body
        });
        await banHistory.save();

        res.status(200).json({ message: 'Organiser banned successfully.' });
    } catch (error) {
        res.status(400).json({ error: 'Error banning organiser', details: error.message });
    }
};

// Unban an organiser
exports.unBanOrganiser = async (req, res) => {
    try {
        const organiser = await Organiser.findById(req.params.id);
        if (!organiser) {
            return res.status(404).json({ error: 'Organiser not found' });
        }
        await Organiser.findByIdAndUpdate(req.params.id, { banned: false });

        // Update BanHistory entry for unban
        await BanHistory.findOneAndUpdate(
            { bannedEntity: organiser._id, entityType: 'Organiser', active: true },
            { active: false }  // Mark as reverted
        );

        res.status(200).json({ message: 'Organiser unbanned successfully.' });
    } catch (error) {
        res.status(400).json({ error: 'Error unbanning organiser', details: error.message });
    }
};

// Ban a player and create BanHistory entry
exports.banPlayer = async (req, res) => {
    try {
        const player = await Player.findById(req.params.id);
        if (!player) {
            return res.status(404).json({ error: 'Player not found' });
        }
        await Player.findByIdAndUpdate(req.params.id, { banned: true });

        // Create BanHistory entry
        const banHistory = new BanHistory({
            bannedEntity: player._id,
            entityType: 'Player',
            reason: req.body.reason,  // Assume reason is passed in the body
        });
        await banHistory.save();

        res.status(200).json({ message: 'Player banned successfully.' });
    } catch (error) {
        res.status(400).json({ error: 'Error banning player', details: error.message });
    }
};

// Unban a player
exports.unBanPlayer = async (req, res) => {
    try {
        const player = await Player.findById(req.params.id);
        if (!player) {
            return res.status(404).json({ error: 'Player not found' });
        }
        await Player.findByIdAndUpdate(req.params.id, { banned: false });

        // Update BanHistory entry for unban
        await BanHistory.findOneAndUpdate(
            { bannedEntity: player._id, entityType: 'Player', active: true },
            { active: false }  // Mark as reverted
        );

        res.status(200).json({ message: 'Player unbanned successfully.' });
    } catch (error) {
        res.status(400).json({ error: 'Error unbanning player', details: error.message });
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
        const reports = await Report.find()
            .populate("reportedBy", "username")// Populate the Player who reported
            .populate("reportedOrganiser", "username") // Correct field name
            .lean() 
            .exec();// Ensures proper async behavior

        res.status(200).json(reports);
    } catch (error) {
        res.status(500).json({ 
            error: "Error fetching reports", 
            details: error.message 
        });
    }
};

exports.reviewedOrNot= async (req, res) => {
    try {
      const { status } = req.body; // Get the new status from request body
  
      // Find the report by ID and update the status
      const updatedReport = await Report.findByIdAndUpdate(
        req.params.id,
        { status }, // Update only the status field
        { new: true } // Return the updated document
      );
  
      if (!updatedReport) {
        return res.status(404).json({ error: "Report not found" });
      }
  
      res.json(updatedReport); // Send back the updated report
    } catch (error) {
      console.error("Error updating report:", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  };


exports.getDashboard = async (req, res) => {
    try {
        const currentDate = new Date();
        const startDate4WeeksAgo = new Date();
        startDate4WeeksAgo.setDate(currentDate.getDate() - 28); // 4 weeks ago
        const startDate4MonthsAgo = new Date();
        startDate4MonthsAgo.setMonth(currentDate.getMonth() - 4); // 4 months ago
        const startDate4YearsAgo = new Date();
        startDate4YearsAgo.setFullYear(currentDate.getFullYear() - 4); // 4 years ago

        // Function to get the total prize pool grouped by week, month, and year
        const getPrizePoolByPeriod = async (startDate, endDate, groupBy) => {
            return await Tournament.aggregate([
                { 
                    $match: { 
                        endDate: { $gte: startDate, $lte: endDate } 
                    } 
                },
                {
                    $group: {
                        _id: {
                            year: { $year: "$endDate" },
                            month: { $month: "$endDate" },
                            week: { $week: "$endDate" },
                        },
                        totalPrizePool: { $sum: "$prizePool" },
                    }
                },
                {
                    $project: {
                        _id: 0,
                        period: {
                            $cond: {
                                if: { $eq: [groupBy, "week"] },
                                then: "$_id.week",
                                else: {
                                    $cond: {
                                        if: { $eq: [groupBy, "month"] },
                                        then: "$_id.month",
                                        else: "$_id.year"
                                    }
                                }
                            }
                        },
                        totalPrizePool: 1
                    }
                },
                { $sort: { period: -1 } },
                { $limit: 4 }
            ]);
        };

        // Function to calculate the average prize pool per week, month, or year
        const calculateAveragePrizePool = async (startDate, groupBy) => {
            const prizePoolData = await getPrizePoolByPeriod(startDate, currentDate, groupBy);
            const totalPrizePool = prizePoolData.reduce((acc, data) => acc + data.totalPrizePool, 0);
            const averagePrizePool = prizePoolData.length > 0 ? totalPrizePool / prizePoolData.length : 0;
            return {
                averagePrizePool,
                prizePoolData,
            };
        };

        // Calculate average prize pool per week (last 4 weeks)
        const { averagePrizePool: avgWeeklyPrizePool, prizePoolData: weeklyPrizePoolData } = await calculateAveragePrizePool(startDate4WeeksAgo, "week");

        // Calculate average prize pool per month (last 4 months)
        const { averagePrizePool: avgMonthlyPrizePool, prizePoolData: monthlyPrizePoolData } = await calculateAveragePrizePool(startDate4MonthsAgo, "month");

        // Calculate average prize pool per year (last 4 years)
        const { averagePrizePool: avgYearlyPrizePool, prizePoolData: yearlyPrizePoolData } = await calculateAveragePrizePool(startDate4YearsAgo, "year");

        // Your existing code for fetching other data
        const organisers = await Organiser.find();
        const players = await Player.find();
        const tournaments = await Tournament.find();
        const totalTeams = await Team.countDocuments();
        const totalBannedPlayers = await Player.countDocuments({ banned: true });
        const totalTournamentsConducted = organisers.reduce((acc, organiser) => acc + organiser.tournamentsConducted, 0);
        const totalBannedOrgs = await Organiser.countDocuments({ banned: true });

        const ongoingTournamentsCount = await Tournament.countDocuments({
            startDate: { $lte: currentDate },
            endDate: { $gte: currentDate }
        });

        const pendingTournamentsCount = await Tournament.countDocuments({ status: 'Pending' });
        const tournamentToBeApproved = await Tournament.find({ status: 'Pending' }).populate('organiser');
        const activeTournamentsCount = await Tournament.countDocuments({
             startDate: { $lte: currentDate },
             endDate: { $gte: currentDate },
             status: 'Approved'
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

        const reports = await Report.find()
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
            reports,
            weeklyPrizePoolData,
            avgWeeklyPrizePool,
            monthlyPrizePoolData,
            avgMonthlyPrizePool,
            yearlyPrizePoolData,
            avgYearlyPrizePool,
        });
    } catch (error) {
        res.status(500).json({ error: 'Error fetching dashboard data', details: error.message });
    }
};
// controllers/adminController.js

exports.getBanHistory = async (req, res) => {
    try {
        // Get the current date
        const currentDate = new Date();
        
        // Calculate the date 1 month ago
        const lastMonthDate = new Date(currentDate.setMonth(currentDate.getMonth() - 1));
        
        // Fetch BanHistory records created in the last month
        const banHistory = await BanHistory.find({
            createdAt: { $gte: lastMonthDate } // Filter to only get reports from the last month
        }).populate('bannedEntity').exec();

        // Return the populated ban history
        res.status(200).json({ banHistory });
    } catch (error) {
        res.status(500).json({ error: 'Error fetching ban history', details: error.message });
    }
};
