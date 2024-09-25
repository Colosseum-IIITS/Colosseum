const Organiser = require("../models/Organiser");
const Player = require("../models/Player");
const Tournament = require("../models/Tournament");
const Team = require("../models/Team");
const bcrypt = require("bcrypt");

// Search Organisation
exports.getOrganiserByUsername = async (req, res) => {
  const { searchTerm } = req.query; // Search term will be passed as a query parameter

  try {
    // Perform a case-insensitive search on the organiser username
    const organiser = await Organiser.findOne({
      username: { $regex: new RegExp(searchTerm, "i") },
    })
      .populate("followers") // Populate followers details
      .populate("tournaments"); // Populate tournaments organised by the organiser

    // Check if the organiser exists
    if (!organiser) {
      return res.status(404).json({ message: "Organiser not found" });
    }

    res.status(200).json({ organiser });
  } catch (error) {
    console.error("Error fetching organiser:", error);
    res
      .status(500)
      .json({ error: "Error fetching organiser", details: error.message });
  }
};

exports.updateOrganiserSettings = async (req, res) => {
  const { showTournaments, showFollowerCount, showPrizePool } = req.body;
  const { id } = req.user;

  try {
    const updatedVisibility = {
      showTournaments: !!showTournaments,
      showFollowerCount: !!showFollowerCount,
      showPrizePool: !!showPrizePool,
    };

    await Organiser.findByIdAndUpdate(id, {
      dashboardVisibility: updatedVisibility,
    });

    res.redirect("/organiser/dashboard");
  } catch (error) {
    console.error("Error updating visibility settings:", error);
    res.status(500).json({ error: "Failed to update settings" });
  }
};

exports.updateUsername = async (req, res) => {
  const { newUsername } = req.body;
  const { _id } = req.user;

  try {
    const organiser = await Organiser.findOne({ _id });
    if (!organiser) {
      return res.status(404).json({ message: "Organiser not found" });
    }

    const existingOrganiser = await Organiser.findOne({
      username: newUsername,
    });
    if (existingOrganiser) {
      return res.status(400).json({ message: "Username already taken" });
    }

    organiser.username = newUsername;
    await organiser.save();

    res
      .status(200)
      .json({ message: "Username updated successfully", organiser });
  } catch (error) {
    console.error("Error updating username:", error);
    res
      .status(500)
      .json({ error: "Error updating username", details: error.message });
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
  const { id } = req.user; // Assuming user ID is from JWT
  const {
    descriptionVisible,
    profilePhotoVisible,
    tournamentsVisible,
    followersVisible,
  } = req.body;

  // Convert the string values to booleans
  const updatedVisibilitySettings = {
    descriptionVisible: descriptionVisible === 'on', // true if checked
    profilePhotoVisible: profilePhotoVisible === 'on', // true if checked
    tournamentsVisible: tournamentsVisible === 'on', // true if checked
    followersVisible: followersVisible === 'on', // true if checked
  };

  try {
    const organiser = await Organiser.findByIdAndUpdate(
      id,
      { visibilitySettings: updatedVisibilitySettings },
      { new: true }
    );

    if (!organiser) {
      return res.status(404).json({ message: "Organiser not found" });
    }

    res.status(200).redirect(`/api/organiser/${organiser.username}/dashboard`);
  } catch (error) {
    console.error("Error updating visibility settings:", error);
    res.status(500).json({
      error: "Error updating visibility settings",
      details: error.message,
    });
  }
};


exports.renderUpdateVisibilitySettings = async (req, res) => {
    const { id } = req.user; // Assuming user ID is from JWT
    try {
        const organiser = await Organiser.findById(id);

        if (!organiser) {
            return res.status(404).json({ message: "Organiser not found" });
        }

        res.render('updateOrganiserDashboardVisibility', { organiser });
    } catch (error) {
        console.error("Error fetching organiser data:", error);
        res.status(500).json({ error: "Error fetching organiser data", details: error.message });
    }
};


exports.getOrganiserDashboard = async (req, res) => {
    const { username } = req.params;  // Organiser's username passed in the URL
     // Assume role passed as query, default is player
    const loggedInUserId = req.user._id;

    try {
        // Find the organiser by username
        const organiser = await Organiser.findOne({ username })
            .populate('tournaments')
            .populate('followers');

        if (!organiser) {
            return res.status(404).json({ message: 'Organiser not found' });
        }
         const isOwner = loggedInUserId.equals(organiser._id);   // Common details
        const totalTournaments = organiser.tournaments.length;
        const followerCount = organiser.followers.length;
        const tournaments = await Tournament.find({ organizer: organiser._id });

        const totalPrizePool = tournaments.reduce(
            (sum, tournament) => sum + tournament.prizePool,
            0
        );

        const currentDate = new Date();

        const completedTournaments = tournaments.filter(
            (t) => t.endDate < currentDate && t.status === "Completed"
        );
        const ongoingTournaments = tournaments.filter(
            (t) =>
                t.startDate <= currentDate &&
                t.endDate >= currentDate &&
                t.status === "Approved"
        );
        const upcomingTournaments = tournaments.filter(
            (t) => t.startDate > currentDate && t.status !== "Completed"
        );

        // Handle visibility settings for players
        const visibilitySettings = organiser.visibilitySettings || {
            showFollowers: true,
            showTotalPrizePool: true,
            showTournaments: true
        };

        // Player's view: Apply visibility settings
        res.render('organiserDashboard', {
                organiser,
                isOwner,
                visibilitySettings,
                followerCount: visibilitySettings.showFollowers ? followerCount : 'Hidden',
                totalPrizePool: visibilitySettings.showTotalPrizePool ? totalPrizePool : 'Hidden',
                totalTournaments: visibilitySettings.showTournaments ? totalTournaments : 'Hidden',
                ongoingTournaments: visibilitySettings.showTournaments ? ongoingTournaments : [],
                upcomingTournaments: visibilitySettings.showTournaments ? upcomingTournaments : [],
                completedTournaments: visibilitySettings.showTournaments ? completedTournaments : []
            });


        // Organiser's view: Show everything

    } catch (error) {
        console.error('Error fetching organiser dashboard:', error);
        res.status(500).json({ error: 'Error fetching organiser dashboard', details: error.message });
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
