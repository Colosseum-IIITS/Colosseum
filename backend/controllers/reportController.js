// controllers/reportController.js
const Report = require('../models/Report');
const Player = require('../models/Player');
const Organiser = require('../models/Organiser');

// Player reports a team
exports.reportTeam = async (req, res) => {
    const { teamId, reason } = req.body;
    const playerId = req.user._id; // Extracting user ID from token

    try {
        const report = new Report({
            reportedBy: playerId,
            reportType: 'Team',
            reportedTeam: teamId,
            reason
        });
        await report.save();
        res.status(201).json({ message: "Team reported successfully", report });
    } catch (error) {
        res.status(500).json({ error: "Error reporting team", details: error.message });
    }
};

// Player reports an organiser
exports.reportOrganiser = async (req, res) => {
    const { organiserId, reason } = req.body;
    const playerId = req.user._id; // Extracting user ID from token

    try {
        const report = new Report({
            reportedBy: playerId,
            reportType: 'Organiser',
            organiser: organiserId,
            reason
        });
        await report.save();
        res.status(201).json({ message: "Organiser reported successfully", report });
    } catch (error) {
        res.status(500).json({ error: "Error reporting organiser", details: error.message });
    }
};

// Organiser sees reported teams
exports.getReportedTeams = async (req, res) => {
    try {
        const reports = await Report.find({ reportType: 'Team' }).populate('reportedBy reportedTeam');
        res.status(200).json(reports);
    } catch (error) {
        res.status(500).json({ error: "Error fetching reported teams", details: error.message });
    }
};

// Admin sees reported organisers
exports.getReportedOrganisers = async (req, res) => {
    try {
        const reports = await Report.find({ reportType: 'Organiser' }).populate('reportedBy organiser');
        res.status(200).json(reports);
    } catch (error) {
        res.status(500).json({ error: "Error fetching reported organisers", details: error.message });
    }
};
