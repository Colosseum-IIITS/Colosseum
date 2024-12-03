// controllers/reportController.js
const Report = require('../models/Report');
const Player = require('../models/Player');
const Organiser = require('../models/Organiser');

// Player reports a team
exports.reportTeam = async (req, res) => {
    const { teamName, reason } = req.body;
    const playerId = req.user._id;
  
    try {
      // Create a new report entry
      const report = new Report({
        reportedBy: playerId,
        reportType: 'Team',
        reportedTeam: teamName,
        reason,
      });
  
      // Save report to the database
      await report.save();
  
      // Send response if everything is okay
      res.status(200).json({ message: 'Team reported successfully' });
    } catch (error) {
      console.error('Error reporting team:', error);
      res.status(500).json({
        error: 'Error reporting team',
        details: error.message,
      });
    }
  };
  

// Player reports an organiser
exports.reportOrganiser = async (req, res) => {
    const { organiserName, reason } = req.body;
    const userId = req.user._id;
    const isOrganiser = req.path.includes('OreportO2A'); // Check if the request is from an Organiser

    try {
        const organiser = await Organiser.findOne({ username: organiserName });
        if (!organiser) {
            return res.status(404).json({ error: "Organiser not found" });
        }

        const report = new Report({
            reportedBy: userId,
            reportType: 'Organiser',
            reportedOrganiser: organiser._id,
            reason
        });
        await report.save();

        if (isOrganiser) {
            return res.status(200).json({ message: 'Organiser report submitted successfully' });
        } else {
            return res.status(200).json({ message: 'Organiser reported successfully' });
        }
    } catch (error) {
        res.status(500).json({ error: "Error reporting organiser", details: error.message });
    }
};

// Organiser sees reported teams
exports.getReportedTeams = async (req, res) => {
    try {
        const reports = await Report.find({ reportType: 'Team' })
            .populate('reportedBy', 'name')
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
            .populate('reportedBy', 'name')
            .populate('reportedOrganiser', 'name')
            .exec();

        res.status(200).json(reports);
    } catch (error) {
        res.status(500).json({ error: "Error fetching reported organisers", details: error.message });
    }
};
