const Organiser = require("../models/Organiser");
const Player = require("../models/Player");
const Tournament = require("../models/Tournament");
const Team = require("../models/Team");
const bcrypt = require("bcrypt");

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
          return res.status(200).json({ message: 'No organisers found', organiser: [] });
      }

      console.log(`${organisers.length} organisers found.`);
      return res.status(200).json({ organiser: organisers });
      
  } catch (error) {
      console.error('Error fetching organisers:', error);
      return res.status(500).json({ error: 'Error fetching organisers', details: error.message });
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
          console.log(organiser.tournaments);
         const isOwner = loggedInUserId.equals(organiser._id);   // Common details
        const totalTournaments = organiser.tournaments.length;
        const followerCount = organiser.followers.length;
        const tournamentList = await Tournament.find({ organizer: organiser._id });
        console.log('Tournaments fetched are'+ organiser.tournaments);

        const totalPrizePool = tournamentList.reduce(
            (sum, tournament) => sum + tournament.prizePool,
            0
        );

        const currentDate = new Date();

        const completedTournaments = tournamentList.filter(
            (t) => t.endDate < currentDate && t.status === "Completed"
        );
        const ongoingTournaments = tournamentList.filter(
            (t) =>
                t.startDate <= currentDate &&
                t.endDate >= currentDate &&
                t.status === "Approved"
        );
        const upcomingTournaments = tournamentList.filter(
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
exports.getMyOrganisers = async (req, res) => {
    const { _id } = req.user; // Player ID

    try {
        const player = await Player.findById(_id).populate({
            path: 'following', // Assuming this is the field in Player model
            model: 'Organiser',
            populate: {
                path: 'tournaments', // Assuming each organiser has a tournaments field
                model: 'Tournament' // Replace with your actual tournament model name
            }
        });

        if (!player) {
            return res.status(404).json({ message: 'Player not found' });
        }

        res.status(200).json(player.following); // Return the followed organisers
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error retrieving followed organisers' });
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
