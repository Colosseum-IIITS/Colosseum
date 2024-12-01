const Organiser = require("../models/Organiser");
const Player = require("../models/Player");
const Tournament = require("../models/Tournament");
const Team = require("../models/Team");
const Report = require("../models/Report");
const bcrypt = require("bcrypt");



// Delete a tournament by tid
exports.deleteTournament = async (req, res) => {
    const { tournamentId } = req.params; // `tournamentId` refers to `tid` here

    try {
        // Find the tournament by `tid` (not by `_id`)
        const tournament = await Tournament.findOne({ tid: tournamentId });

        if (!tournament) {
            return res.status(404).json({ message: "Tournament not found" });
        }

        if (!tournament.organiser.equals(req.user._id)) {
            return res.status(403).json({ message: "You are not authorized to delete this tournament" });
        }

        await Organiser.findByIdAndUpdate(tournament.organiser, {
            $pull: { tournaments: tournament._id }
        });

        await Tournament.findOneAndDelete({ tid: tournamentId });

        res.status(200).json({ message: "Tournament deleted successfully" });
    } catch (error) {
        console.error("Error deleting tournament:", error);
        res.status(500).json({ message: "Error deleting tournament", error });
    }
};

// Search Organisation
exports.getOrganiserByUsername = async (req, res) => {
  const { searchTerm } = req.query;

  try {
      const organisers = await Organiser.find({ username: { $regex: new RegExp(searchTerm, 'i') } })
          .populate('followers')
          .populate('tournaments');

      console.log(`Search term received: ${searchTerm}`);
      
      if (organisers.length === 0) {
          console.log(`No organisers found for the username: ${searchTerm}`);
          return res.status(404).json({
              message: 'No organisers found',
              organisationResults: [],
              searchTerm: searchTerm
          });
      }

      console.log(`${organisers.length} organisers found.`);
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
  const { currentPassword, newPassword } = req.body;
  const { _id } = req.user;

  console.log("Updating password for:", _id);
  try {
    const organiser = await Organiser.findOne({ _id });
    if (!organiser) {
      return res.status(404).json({ message: "Organiser not found" });
    }

    const isMatch = await bcrypt.compare(currentPassword, organiser.password);
    if (!isMatch) {
      return res
        .status(400)
        .json({ message: "New Password Cannot be the Same as Old Password" });
    }

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

  try {
    const organiser = await Organiser.findOne({ _id });
    if (!organiser) {
      return res.status(404).json({ message: "Organiser not found" });
    }

    organiser.description = newDescription;
    await organiser.save();

    res
      .status(200)
      .json({ message: "Description updated successfully", organiser });
  } catch (error) {
    console.error("Error updating description:", error);
    res
      .status(500)
      .json({ error: "Error updating description", details: error.message });
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
          return res.status(404).json({ message: 'Player not found' });
      }

      console.log('Followed Organisers:', player.following);

      res.render('homepage', {
          followedOrganisers: player.following
      });
  } catch (error) {
      console.error('Error retrieving followed organisers:', error);
      return res.status(500).json({
          error: 'Error retrieving followed organisers',
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
      return res.status(404).json({ message: "Organiser not found" });
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
