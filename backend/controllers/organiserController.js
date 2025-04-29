const Organiser = require("../models/Organiser");
const Player = require("../models/Player");
const Tournament = require("../models/Tournament");
const Team = require("../models/Team");
const Report = require("../models/Report");
const bcrypt = require("bcrypt");
const redis = require("../utils/redisClient");



// Delete a tournament by tid
// controllers/tournamentController.js

exports.deleteTournament = async (req, res) => {
  const { tournamentId } = req.params; // tournamentId refers to _id

  try {
      // Find the tournament by _id
      const tournament = await Tournament.findById(tournamentId);

      if (!tournament) {
          return res.status(404).json({ message: "Tournament not found" });
      }

      if (!tournament.organiser.equals(req.user._id)) {
          return res.status(403).json({ message: "You are not authorized to delete this tournament" });
      }

      // Remove the tournament from the organiser's list
      await Organiser.findByIdAndUpdate(tournament.organiser, {
          $pull: { tournaments: tournament._id }
      });

      // Delete the tournament
      await Tournament.findByIdAndDelete(tournamentId);

      res.status(200).json({ message: "Tournament deleted successfully" });
  } catch (error) {
      console.error("Error deleting tournament:", error);
      res.status(500).json({ message: "Error deleting tournament", error });
  }
};  

// Search Organisation
exports.getOrganiserByUsername = async (req, res) => {
  const { searchTerm, page = 1, limit = 10 } = req.query;
  const skip = (page - 1) * limit;

  try {
    const cacheValue = await redis.get(searchTerm);
    if (cacheValue) {
      console.log(`Cache hit for search term: ${searchTerm}`);
      return res.status(200).json({
        message: 'Organisers fetched from cache',
        organisationResults: JSON.parse(cacheValue),
        searchTerm: searchTerm
      });
    }
    
    let organisers;

    if (!searchTerm || searchTerm.trim() === '') {
      organisers = await Organiser.find()
        .populate('followers')
        .populate('tournaments');
    } else {
      organisers = await Organiser.find({
        username: { $regex: new RegExp(searchTerm, 'i') }
      })
        .populate('followers')
        .populate('tournaments');
    }

    if (organisers.length === 0) {
      return res.status(404).json({
        message: 'No organisers found',
        organisationResults: [],
        searchTerm: searchTerm
      });
    }

    // Cache the result for 30 minutes
    await redis.setex(searchTerm, 1800, JSON.stringify(organisers));

    return res.status(200).json({
      message: `${organisers.length} organisers found`,
      organisationResults: organisers,
      searchTerm: searchTerm
    });

  } catch (error) {
    console.error('Error fetching organisers:', error);
    return res.status(500).json({
      message: 'Error fetching organisers',
      error: error.message
    });
  }
};


// Rename And Change Naming
exports.updateOrganiserSettings = async (req, res) => {
  const { showTournaments, showFollowerCount, showPrizePool } = req.body;
  const { id } = req.user;

  try {
      const updatedVisibility = {
          showTournaments: !!showTournaments,
          showFollowerCount: !!showFollowerCount,
          showPrizePool: !!showPrizePool,
      };

      const organiser = await Organiser.findByIdAndUpdate(
          id,
          { dashboardVisibility: updatedVisibility },
          { new: true } // Return the updated document
      );

      if (!organiser) {
          return res.status(404).json({ error: "Organiser not found" });
      }

      res.status(200).json({
          message: "Visibility settings updated successfully",
          updatedVisibility: organiser.dashboardVisibility,
      });
  } catch (error) {
      console.error("Error updating visibility settings:", error);
      res.status(500).json({ error: "Failed to update settings" });
  }
};


exports.updateUsername = async (req, res) => {
  const { newUsername } = req.body;
  const { _id } = req.user;

  if (!newUsername) {
    return res.status(400).json({ message: "New username is required" });
  }

  try {
    // Check if username is already taken
    const existingOrganiser = await Organiser.findOne({ username: newUsername });
    if (existingOrganiser) {
      return res.status(400).json({ message: "Username already taken" });
    }

    // Find and update the organiser's username
    const organiser = await Organiser.findByIdAndUpdate(
      _id, 
      { username: newUsername },
      { new: true, runValidators: true }
    );

    if (!organiser) {
      return res.status(404).json({ message: "Organiser not found" });
    }

    res.status(200).json({ message: "Username updated successfully", organiser });
  } catch (error) {
    console.error("Error updating username:", error);
    res.status(500).json({ error: "Error updating username", details: error.message });
  }
};

exports.updateEmail = async (req, res) => {
  const { newEmail } = req.body;
  const { _id } = req.user;

  try {
    const organiser = await Organiser.findOne({ _id });
    if (!organiser) {
      return res.status(404).json({ message: "Organiser not found" });
    }

    const existingOrganiser = await Organiser.findOne({ email: newEmail });
    if (existingOrganiser) {
      return res.status(400).json({ message: "Username already taken" });
    }

    organiser.email = newEmail;
    await organiser.save();

    res.status(200).json({ message: "Email updated successfully", organiser });
  } catch (error) {
    console.error("Error updating Email:", error);
    res
      .status(500)
      .json({ error: "Error updating Email", details: error.message });
  }
};

exports.updatePassword = async (req, res) => {
  const { newPassword } = req.body;  // Only take newPassword from the request
  const { _id } = req.user;

  console.log("Request Body:", req.body);

  // Validate if new password is provided
  if (!newPassword) {
    return res.status(400).json({ message: "New password is required" });
  }

  console.log("Updating password for:", _id);
  try {
    const organiser = await Organiser.findOne({ _id });
    if (!organiser) {
      return res.status(404).json({ message: "Organiser not found" });
    }

    // Hash and update the new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    organiser.password = hashedPassword;
    await organiser.save();

    res.status(200).json({ message: "Password updated successfully" });
  } catch (error) {
    console.error("Error updating password:", error);
    res
      .status(500)
      .json({ error: "Error updating password", details: error.message });
  }
};


exports.updateDescription = async (req, res) => {
  const { newDescription } = req.body;
  const { _id } = req.user;

  console.log("Incoming newDescription:", newDescription);

  try {
    const organiser = await Organiser.findOne({ _id });
    if (!organiser) {
      return res.status(404).json({ message: "Organiser not found" });
    }

    if (!newDescription || newDescription.trim() === "") {
      return res.status(400).json({ message: "Description cannot be empty" });
    }

    organiser.description = newDescription;

    await organiser.save();

    res.status(200).json({ message: "Description updated successfully", organiser });
  } catch (error) {
    console.error("Error updating description:", error);
    res.status(500).json({ error: "Error updating description", details: error.message });
  }
};


exports.updateProfilePhoto = async (req, res) => {
  const { newProfilePhoto } = req.body;
  const { _id } = req.user;

  try {
    const organiser = await Organiser.findOne({ _id });
    if (!organiser) {
      return res.status(404).json({ message: "Organiser not found" });
    }

    organiser.profilePhoto = newProfilePhoto;
    await organiser.save();

    res
      .status(200)
      .json({ message: "Profile Photo updated successfully", organiser });
  } catch (error) {
    console.error("Error updating Profile Photo:", error);
    res
      .status(500)
      .json({ error: "Error updating Profile Photo", details: error.message });
  }
};

exports.updateVisibilitySettings = async (req, res) => {
  const { id } = req.user;
  const {
      descriptionVisible,
      profilePhotoVisible,
      prizePoolVisible,
      tournamentsVisible,
      followersVisible,
  } = req.body;

  // Convert the string values to booleans
  const updatedVisibilitySettings = {
      descriptionVisible: descriptionVisible === 'on', // true if checked
      profilePhotoVisible: profilePhotoVisible === 'on', // true if checked
      prizePoolVisible: prizePoolVisible === 'on', // true if checked
      tournamentsVisible: tournamentsVisible === 'on', // true if checked
      followersVisible: followersVisible === 'on', // true if checked
  };

  try {
      const organiser = await Organiser.findByIdAndUpdate(
          id,
          { visibilitySettings: updatedVisibilitySettings },
          { new: true } // Return the updated document
      );

      if (!organiser) {
          return res.status(404).json({ message: "Organiser not found" });
      }

      res.status(200).json({
          message: "Visibility settings updated successfully",
          updatedVisibilitySettings: organiser.visibilitySettings,
      });
  } catch (error) {
      console.error("Error updating visibility settings:", error);
      res.status(500).json({
          error: "Error updating visibility settings",
          details: error.message,
      });
  }
};


exports.renderUpdateVisibilitySettings = async (req, res) => {
    const { id } = req.user;
    try {
        const organiser = await Organiser.findById(id);

      if (!organiser) {
          return res.status(404).json({ message: "Organiser not found" });
      }

      res.status(200).json({
          message: "Organiser data fetched successfully",
          organiser,
      });
  } catch (error) {
      console.error("Error fetching organiser data:", error);
      res.status(500).json({
          error: "Error fetching organiser data",
          details: error.message,
      });
  }
};


exports.getOrganiserDashboard = async (req, res) => {
    const { username } = req.params;
    const loggedInUserId = req.user._id;

    try {
        const organiser = await Organiser.findOne({ username })
            .populate('tournaments')
            .populate('followers');

      if (!organiser) {
          return res.status(404).json({ message: 'Organiser not found' });
      }

        const isOwner = loggedInUserId.equals(organiser._id);
        console.log("DEBUG:ISOWNER:"+isOwner+"lOGGEDINID:"+loggedInUserId+"ORGID:"+organiser._id);
        const totalTournaments = organiser.tournaments.length;
        console.log("Total Tournaments Count Fetched:"+totalTournaments);
        const followerCount = organiser.followers.length;
        console.log("FollowerCount fetched: "+followerCount);

        const tournamentList = await Tournament.find({ organiser: organiser._id });

      const totalPrizePool = tournamentList.reduce((sum, tournament) => sum + tournament.prizePool, 0);
      console.log("Total Prize Pool:", totalPrizePool);

        const visibilitySettings = organiser.visibilitySettings || {
          descriptionVisible: true,
          profilePhotoVisible: true,
          prizePoolVisible: true,
          tournamentsVisible: true,
          followersVisible: true,
      };

      console.log("Visibility Settings:", visibilitySettings);

      const reports = await Report.find({ reportType: 'Team' }).populate('reportedTeam');
      res.status(200).json({
        organiser,
        isOwner,
        visibilitySettings,
        followerCount,
        totalPrizePool,
        totalTournaments,
        tournamentList,
        reports
    });
    
    } catch (error) {
        console.error('Error fetching organiser dashboard:', error);
        res.status(500).json({ error: 'Error fetching organiser dashboard', details: error.message });
    }
};

exports.getMyOrganisers = async (req, res) => {
  const { _id } = req.user; // Player ID
  console.log("User ID:", _id);

  try {
      const player = await Player.findById(_id).populate({
          path: 'following',
          model: 'Organiser',
          populate: {
              path: 'tournaments',
              model: 'Tournament'
          }
      });

      if (!player) {
          console.log("Player not found");
          return res.status(404).json({ message: "Player not found" });
      }


      return res.status(200).json({
          followedOrganisers: player.following
      });
  } catch (error) {
      console.error("Error retrieving followed organisers:", error);
      return res.status(500).json({
          error: "Error retrieving followed organisers",
          details: error.message,
      });
  }
};

exports.banTeam = async (req, res) => {
  const { teamId } = req.body;
  const { _id } = req.user;


  try {
    const organiser = await Organiser.findById(_id);
    if (!organiser) {
      return res.status(404).json({ message: "Organiser def not found" });
    }

    const team = await Team.findById(teamId);
    if (!team) {
      return res.status(404).json({ message: "Team not found" });
    }

    if (organiser.bannedTeams.includes(teamId)) {
      return res.status(400).json({ message: "Team is already banned" });
    }

    organiser.bannedTeams.push(teamId);
    await organiser.save();

    res.status(200).json({
      message: "Team banned successfully from organiser's tournaments",
      organiser,
    });
  } catch (error) {
    console.error("Error banning team:", error);
    res
      .status(500)
      .json({ error: "Error banning team", details: error.message });
  }
};


// exports.getOrganiserName = async (req, res) => {
//   try {
//     const organiserId = req.user.id; // Assuming user ID is attached to the request (e.g., via JWT)
    
//     const organiser = await Organiser.findById(organiserId);
//     if (!organiser) {
//       return res.status(404).json({ message: 'Organiser not found' });
//     }

//     // Fetch tournaments based on the ObjectIds stored in organiser.tournaments
//     const tournaments = await Tournament.find({
//       '_id': { $in: organiser.tournaments }, // Match any tournament where the _id is in the organiser's tournaments array
//     });

//     // Include username in the response
//     return res.json({
//       username: organiser.username,  // Add the username field to the response
//       visibilitySettings: organiser.visibilitySettings,
//       tournaments: tournaments, // Send full tournament documents
//     });
//   } catch (error) {
//     console.error('Error fetching organiser:', error);
//     res.status(500).json({ message: 'Internal server error' });
//   }
// };


// Route Has Been Tested and Is working successfully

// create update organiserdetails <DONE>
// update passwords  <DONE>
// Dashboards with details-->{
//      Tournaments Conducted:<DONE>
//      total people played with the Org:<DONE>
//      Total prizepool <DONE>
//      current Matches <DONE>
//      upcoming Matches <DONE>
//      completed matches <DONE>
//      }
// Ban Teams from organiser<DONE>
// Ban Players from organiser



exports.getOrganiserName = async (req, res) => {
  try {
    const organiserId = req.user.id; // Assuming user ID is attached to the request (e.g., via JWT)

    // Fetch organiser from the database
    const organiser = await Organiser.findById(organiserId);
    if (!organiser) {
      return res.status(404).json({ message: 'Organiser not found' });
    }

    // Fetch tournaments based on the ObjectIds stored in organiser.tournaments
    const tournaments = await Tournament.find({
      '_id': { $in: organiser.tournaments }, // Match any tournament where the _id is in the organiser's tournaments array
    });

    // Send only the necessary fields in the response
    return res.json({
      username: organiser.username,  // Include username in the response
      visibilitySettings: organiser.visibilitySettings,
      tournaments: tournaments, // Full tournament documents (if needed)
      email: organiser.email,
      description: organiser.description,
      followers: organiser.followers.length,  // Send the count of followers
      rating: organiser.rating,
      banned: organiser.banned  // Include banned status
    });
  } catch (error) {
    console.error('Error fetching organiser:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Get revenue data for an organiser
exports.getOrganiserRevenue = async (req, res) => {
  try {
      // Extract organiser ID from authenticated user in middleware
      const organiserId = req.user._id; 

      if (!organiserId) {
          return res.status(401).json({ message: "Unauthorized access" });
      }

      // Fetch the organiser along with their tournaments
      const organiser = await Organiser.findById(organiserId).populate("tournaments");

      if (!organiser) {
          return res.status(404).json({ message: "Organiser not found" });
      }

      // Calculate total revenue from all tournaments
      const totalRevenue = organiser.tournaments.reduce((sum, tournament) => {
          return sum + (tournament.revenue || 0);
      }, 0);

      // Format data for bar graph (each tournament's revenue)
      const tournamentRevenueData = organiser.tournaments.map((tournament) => ({
          name: tournament.name,
          revenue: tournament.revenue || 0,
      }));

      return res.status(200).json({
          totalRevenue,
          tournamentRevenueData,
      });
  } catch (error) {
      console.error("Error fetching organiser revenue:", error);
      return res.status(500).json({ message: "Server error", error });
  }
};

exports.getTopOrganisers = async (req, res) => {
  try {
    const currentDate = new Date();
    const weekStart = new Date(currentDate);
    weekStart.setDate(currentDate.getDate() - 7);
    
    const monthStart = new Date(currentDate);
    monthStart.setMonth(currentDate.getMonth() - 1);
    
    const yearStart = new Date(currentDate);
    yearStart.setFullYear(currentDate.getFullYear() - 1);

    // Get all organisers with their tournaments
    const organisers = await Organiser.find().populate('tournaments');

    // Process data for different time periods
    const processOrganisers = (startDate) => {
      return organisers
        .map(org => ({
          name: org.username,
          tournaments: org.tournaments.filter(t => 
            new Date(t.createdAt) >= startDate && 
            new Date(t.createdAt) <= currentDate
          ).length
        }))
        .sort((a, b) => b.tournaments - a.tournaments)
        .slice(0, 5); // Get top 5
    };

    const response = {
      weekly: processOrganisers(weekStart),
      monthly: processOrganisers(monthStart),
      yearly: processOrganisers(yearStart)
    };

    res.status(200).json(response);
  } catch (error) {
    console.error("Error getting top organisers:", error);
    res.status(500).json({ 
      error: "Error getting top organisers",
      details: error.message 
    });
  }
};

exports.getTournamentPrizePoolAverages = async (req, res) => {
  try {
    const currentDate = new Date();
    
    // Calculate date ranges
    const weekStart = new Date(currentDate);
    weekStart.setDate(currentDate.getDate() - 28); // Last 4 weeks
    
    const monthStart = new Date(currentDate);
    monthStart.setMonth(currentDate.getMonth() - 12); // Last 12 months
    
    const yearStart = new Date(currentDate);
    yearStart.setFullYear(currentDate.getFullYear() - 4); // Last 4 years

    // Get weekly averages
    const weeklyAverages = await Tournament.aggregate([
      {
        $match: {
          createdAt: { $gte: weekStart },
          prizePool: { $exists: true }
        }
      },
      {
        $group: {
          _id: { $week: "$createdAt" },
          average: { $avg: "$prizePool" },
          period: { $first: { $week: "$createdAt" } }
        }
      },
      { $sort: { period: 1 } },
      {
        $project: {
          period: { $concat: ["Week ", { $toString: "$period" }] },
          average: { $round: ["$average", 2] }
        }
      }
    ]);

    // Get monthly averages
    const monthlyAverages = await Tournament.aggregate([
      {
        $match: {
          createdAt: { $gte: monthStart },
          prizePool: { $exists: true }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" }
          },
          average: { $avg: "$prizePool" }
        }
      },
      {
        $project: {
          period: {
            $let: {
              vars: {
                monthsInString: [
                  "", "Jan", "Feb", "Mar", "Apr", "May", "Jun",
                  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
                ]
              },
              in: { $arrayElemAt: ["$$monthsInString", "$_id.month"] }
            }
          },
          average: { $round: ["$average", 2] }
        }
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } }
    ]);

    // Get yearly averages
    const yearlyAverages = await Tournament.aggregate([
      {
        $match: {
          createdAt: { $gte: yearStart },
          prizePool: { $exists: true }
        }
      },
      {
        $group: {
          _id: { $year: "$createdAt" },
          average: { $avg: "$prizePool" }
        }
      },
      {
        $project: {
          period: { $toString: "$_id" },
          average: { $round: ["$average", 2] }
        }
      },
      { $sort: { period: 1 } }
    ]);

    res.status(200).json({
      weekly: weeklyAverages,
      monthly: monthlyAverages,
      yearly: yearlyAverages
    });

  } catch (error) {
    console.error("Error getting prize pool averages:", error);
    res.status(500).json({
      error: "Error getting prize pool averages",
      details: error.message
    });
  }
};


