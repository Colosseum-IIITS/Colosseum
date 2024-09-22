const Report = require("../models/Report");
const Player = require("../models/Player");
const Team = require("../models/Team");
const Organiser = require("../models/Organiser");
const jwt = require('jsonwebtoken');

exports.reportTeam = async (req, res) => {
  const { reportedTeam, reportType, organiser, tournament, reason } = req.body;
  const { _id: playerId } = req.user;

  try {
    const player = await Player.findById(playerId);
    if (!player) {
      return res.status(404).json({ message: "Player not found" });
    }
    if (reportType) {
      const team = await Team.findById(reportedTeam);
      if (!reportType) {
        if (!team) {
          return res.status(404).json({ message: "Team not found" });
        }
      }
    }

    const organiserData = await Organiser.findById(organiser);
    if (!organiserData) {
      return res.status(404).json({ message: "Organiser not found" });
    }

    const report = new Report({
      reportedBy: playerId,
      reportedTeam,
      organiser,
      tournament,
      reason,
    });

    await report.save();
    res.status(201).json({ message: "Report submitted successfully", report });
  } catch (error) {
    console.error("Error reporting team:", error);
    res
      .status(500)
      .json({ error: "Error reporting team", details: error.message });
  }
};

exports.fetchTeamReportsForOrganiser = async (organiserId) => {
  try {
    const reports = await Report.find({
      organiser: organiserId, // Organiser making the request
      reportType: false, // False indicates team reports
    }).populate("reportedBy reportedTeam tournament");

    return reports; // Return the fetched reports
  } catch (error) {
    throw new Error("Error fetching team reports: " + error.message);
  }
};

// Function to fetch organiser-related reports (reportType: true)
exports.fetchOrganiserReportsForAdmin = async () => {
  try {
    const reports = await Report.find({
      reportType: true, // True indicates organiser reports
    }).populate("reportedBy organiser tournament");

    return reports; // Return the fetched reports
  } catch (error) {
    throw new Error("Error fetching organiser reports: " + error.message);
  }
};
