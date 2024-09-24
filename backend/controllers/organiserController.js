const Organiser = require('../models/Organiser');
const Player = require('../models/Player');
const Tournament = require('../models/Tournament');
const Team = require('../models/Team');
const bcrypt = require('bcrypt');

// Search Organisation
exports.getOrganiserByUsername = async (req, res) => {
    const { searchTerm } = req.query;  // Search term will be passed as a query parameter

    try {
        // Perform a case-insensitive search on the organiser username
        const organiser = await Organiser.findOne({ username: { $regex: new RegExp(searchTerm, 'i') } })
            .populate('followers')  // Populate followers details
            .populate('tournaments');  // Populate tournaments organised by the organiser

        console.log(`Search term received: ${searchTerm}`); // Log received search term
        // Check if the organiser exists
        if (!organiser) {
            console.log(`No organiser found for the username: ${searchTerm}`); // Log if no organiser is found
            return res.status(200).json({ message: 'No organiser found' }); // Send 200 OK for not found
        }

        console.log(`Organiser found: ${organiser.username}`); // Log if organiser is found
        res.status(200).json({ organiser }); // Send organiser data if found
    } catch (error) {
        console.error('Error fetching organiser:', error);
        res.status(500).json({ error: 'Error fetching organiser', details: error.message });
    }
};


exports.updateUsername = async (req, res) => {
    const { newUsername } = req.body;
    const { _id } = req.user;

    try {
        const organiser = await Organiser.findOne({ _id });
        if (!organiser) {
            return res.status(404).json({ message: 'Organiser not found' });
        }

        const existingOrganiser = await Organiser.findOne({ username: newUsername });
        if (existingOrganiser) {
            return res.status(400).json({ message: 'Username already taken' });
        }

        organiser.username = newUsername;
        await organiser.save();

        res.status(200).json({ message: 'Username updated successfully', organiser });
    } catch (error) {
        console.error('Error updating username:', error);
        res.status(500).json({ error: 'Error updating username', details: error.message });
    }
};


exports.updateEmail = async (req, res) => {
    const { newEmail } = req.body;
    const { _id } = req.user;

    try {
        const organiser = await Organiser.findOne({ _id });
        if (!organiser) {
            return res.status(404).json({ message: 'Organiser not found' });
        }

        const existingOrganiser = await Organiser.findOne({ email:newEmail  });
        if (existingOrganiser) {
            return res.status(400).json({ message: 'Username already taken' });
        }

        organiser.email = newEmail;
        await organiser.save();

        res.status(200).json({ message: 'Email updated successfully', organiser });
    } catch (error) {
        console.error('Error updating Email:', error);
        res.status(500).json({ error: 'Error updating Email', details: error.message });
    
}
};

exports.updatePassword = async (req, res) => {
    const { currentPassword, newPassword } = req.body;
    const { _id } = req.user;

    console.log('Updating password for:', _id); 
    try {
        const organiser = await Organiser.findOne({ _id });
        if (!organiser) {
            return res.status(404).json({ message: 'Organiser not found' });
        }

        const isMatch = await bcrypt.compare(currentPassword, organiser.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'New Password Cannot be the Same as Old Password' });
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);
        organiser.password = hashedPassword;
        await organiser.save();

        res.status(200).json({ message: 'Password updated successfully' });
    } catch (error) {
        console.error('Error updating password:', error);
        res.status(500).json({ error: 'Error updating password', details: error.message });
    }
};




exports.updateDescription = async (req, res) => {
    const { newDescription } = req.body;
    const { _id } = req.user;

    try {
        const organiser = await Organiser.findOne({ _id });
        if (!organiser) {
            return res.status(404).json({ message: 'Organiser not found' });
        }

        organiser.description = newDescription;
        await organiser.save();

        res.status(200).json({ message: 'Description updated successfully', organiser });
    } catch (error) {
        console.error('Error updating description:', error);
        res.status(500).json({ error: 'Error updating description', details: error.message });
    }
};

exports.updateProfilePhoto = async (req, res) => {
    const { newProfilePhoto } = req.body;
    const { _id } = req.user;

    try {
        const organiser = await Organiser.findOne({ _id });
        if (!organiser) {
            return res.status(404).json({ message: 'Organiser not found' });
        }

        organiser.profilePhoto = newProfilePhoto;
        await organiser.save();

        res.status(200).json({ message: 'Profile Photo updated successfully', organiser });
    } catch (error) {
        console.error('Error updating Profile Photo:', error);
        res.status(500).json({ error: 'Error updating Profile Photo', details: error.message });
    }
};

exports.getOrganiserDashboard = async (req, res) => {
    const { _id } = req.user;  
    try {
        const organiser = await Organiser.findById(_id)
            .populate('tournaments')
            .populate('followers');

        if (!organiser) {
            return res.status(404).json({ message: 'Organiser not found' });
        }

        const totalTournaments = organiser.tournaments.length;

        const followerCount = organiser.followers.length;

        const tournaments = await Tournament.find({ organizer: _id });
        const totalPrizePool = tournaments.reduce((sum, tournament) => sum + tournament.prizePool, 0);

        const currentDate = new Date();

        const completedTournaments = tournaments.filter(t => t.endDate < currentDate && t.status === 'Completed');
        const ongoingTournaments = tournaments.filter(t => t.startDate <= currentDate && t.endDate >= currentDate && t.status === 'Approved');
        const upcomingTournaments = tournaments.filter(t => t.startDate > currentDate && t.status !== 'Completed');

        res.status(200).json({
            message: 'Dashboard fetched successfully',
            totalTournaments,
            followerCount,
            totalPrizePool,
            ongoingTournaments,
            upcomingTournaments,
            completedTournaments
        });
    } catch (error) {
        console.error('Error fetching dashboard:', error);
        res.status(500).json({ error: 'Error fetching dashboard', details: error.message });
    }
};

exports.banTeam = async (req, res) => {
    const { teamId } = req.body;  
    const { _id } = req.user;  

    try {
        const organiser = await Organiser.findById(_id);
        if (!organiser) {
            return res.status(404).json({ message: 'Organiser not found' });
        }

        const team = await Team.findById(teamId);
        if (!team) {
            return res.status(404).json({ message: 'Team not found' });
        }

        if (organiser.bannedTeams.includes(teamId)) {
            return res.status(400).json({ message: 'Team is already banned' });
        }

        organiser.bannedTeams.push(teamId);
        await organiser.save();

        res.status(200).json({ message: 'Team banned successfully from organiser\'s tournaments', organiser });
    } catch (error) {
        console.error('Error banning team:', error);
        res.status(500).json({ error: 'Error banning team', details: error.message });
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
