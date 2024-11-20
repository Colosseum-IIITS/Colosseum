// controllers/reportController.js
const Report = require('../models/Report');
const Player = require('../models/Player');
const Organiser = require('../models/Organiser');

// Player reports a team
exports.reportTeam = async (req, res) => {
    const { teamName, reason } = req.body;
    const playerId = req.user._id; // Extracting user ID from token

    try {
        const report = new Report({
            reportedBy: playerId,
            reportType: 'Team',
            reportedTeam: teamName, // Store teamName as a string
            reason
        });
        await report.save();
        res.redirect('/api/player/homepage'); // Redirect after successful report
    } catch (error) {
        res.status(500).json({ error: "Error reporting team", details: error.message });
    }
};

// Player reports an organiser
exports.reportOrganiser = async (req, res) => {
    const { organiserName, reason } = req.body;
    const userId = req.user._id; // Extracting user ID from token
    const isOrganiser = req.path.includes('OreportO2A'); // Check if the request is from an Organiser

    try {
        const organiser = await Organiser.findOne({ username: organiserName }); // Adjust if 'username' is different
        if (!organiser) {
            return res.status(404).json({ error: "Organiser not found" });
        }

        const report = new Report({
            reportedBy: userId,
            reportType: 'Organiser',
            reportedOrganiser: organiser._id, // Link by ObjectId
            reason
        });
        await report.save();

        if (isOrganiser) {
            // If the report was made by an organiser, redirect to that organiser's dashboard
            return res.redirect(`/api/organiser/${req.user.username}/dashboard`);
        } else {
            // If the report was made by a player, redirect to player's homepage
            return res.redirect('/api/player/homepage');
        }
    } catch (error) {
        res.status(500).json({ error: "Error reporting organiser", details: error.message });
    }
};


// Organiser sees reported teams
exports.getReportedTeams = async (req, res) => {
    try {
        const reports = await Report.find({ reportType: 'Team' })
            .populate('reportedBy', 'name') // Populate reporter's name
            .exec();

        res.status(200).json(reports);
    } catch (error) {
        res.status(500).json({ error: "Error fetching reported teams", details: error.message });
    }
};

// Admin sees reported organisers
exports.getReportedOrganisers = async (req, res) => {
    try {
        const reports = await Report.find({ reportType: 'Organiser' })
            .populate('reportedBy', 'name') // Populate reporter's name
            .populate('reportedOrganiser', 'name') // Populate organiser's name
            .exec();

        res.status(200).json(reports);
    } catch (error) {
        res.status(500).json({ error: "Error fetching reported organisers", details: error.message });
    }
};
