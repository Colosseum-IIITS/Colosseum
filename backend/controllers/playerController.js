const Tournament = require('../models/Tournament');
const Player = require('../models/Player');
const Organiser = require('../models/Organiser');
const Team = require('../models/Team');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');


// Func: Follow Organisation
exports.followOrganiser = async (req, res) => {
    const { organiserId } = req.body;
    const { _id } = req.user; // Assuming _id is player's ID

    try {
        const player = await Player.findOne({ _id });
        if (!player) {
            return res.status(404).json({ message: 'Player not found' });
        }

        const organiser = await Organiser.findById(organiserId);
        if (!organiser) {
            return res.status(404).json({ message: 'Organiser not found' });
        }

        // Check if player is already following this organiser
        if (player.following.includes(organiserId)) {
            return res.status(202).json({ message: 'Player is already following this organiser', player, organiser });
        }

        // Add organiser to player's following list
        player.following.push(organiserId);
        await player.save();

        // Add player to organiser's followers list
        organiser.followers.push(player._id);
        await organiser.save();

        res.status(200).json({ message: 'Organiser followed successfully', player, organiser });
    } catch (error) {
        res.status(500).json({ error: 'Error following organiser' });
    }
};


// Func: Unfollow Organisation
exports.unfollowOrganiser = async (req, res) => {
    const { organiserId } = req.body;
    const { _id } = req.user;

    try {
        const player = await Player.findOne({ _id });
        if (!player) {
            return res.status(404).json({ message: 'Player not found' });
        }

        const organiser = await Organiser.findById(organiserId);
        if (!organiser) {
            return res.status(404).json({ message: 'Organiser not found' });
        }

        if (!player.following.includes(organiserId)) {
            return res.status(400).json({ message: 'Player is not following this organiser' });
        }

        player.following.pull(organiserId);
        await player.save();

        organiser.followers.pull(player._id);
        await organiser.save();

        res.status(200).json({ message: 'Organiser unfollowed successfully', player, organiser });
    } catch (error) {
        res.status(500).json({ error: 'Error unfollowing organiser' });
    }
};

// Func: Search tournaments by tid or name
// searchController.js

exports.searchTournaments = async (req, res) => {
    try {
        const { searchTerm } = req.query;
        console.log('Search Term:', searchTerm); // Debugging line

        // Query to find tournaments that are approved (status: "Approved")
        const tournaments = await Tournament.find({
            status: "Approved", // Only include tournaments with status "Approved"
            $or: [
                { tid: new RegExp(searchTerm, 'i') }, // Search by tournament ID (tid)
                { name: new RegExp(searchTerm, 'i') } // Search by tournament name
            ]
        });

        console.log('Approved Tournaments Found:', tournaments); // Debugging line

        // Return a 200 status with the found tournaments
        res.status(200).json(tournaments);
    } catch (error) {
        console.error('Error searching tournaments:', error); // Log the error
        res.status(500).json({ error: 'Error searching tournaments' });
    }
};

exports.joinTournament = async (req, res) => {
    const { tournamentId } = req.body;
    const { _id } = req.user;

    try {
        const player = await Player.findOne({ _id }).populate('team');
        if (!player) {
            return res.status(404).json({ message: 'Player not found' });
        }

        if (!player.team) {
            return res.status(400).json({ message: 'Player must be part of a team' });
        }

        const tournament = await Tournament.findById(tournamentId);
        if (!tournament) {
            return res.status(404).json({ message: 'Tournament not found' });
        }

        // if(tournament.organiser.bannedTeams.includes(player.team._id)) {
        //     return res.status(400).json({ message: 'Your team is banned' });
        // }

        if (tournament.teams.includes(player.team._id)) {
            return res.status(400).json({ message: 'Team is already registered for this tournament' });
        }

        // Fetch the team object using the team ID
        const team = await Team.findById(player.team._id);
        if (!team) {
            return res.status(404).json({ message: 'Team not found' });
        }

        // Create points table entry for the team
        const pointsEntry = {
            ranking: 0, // You can set initial ranking as needed
            teamName: team.name,
            totalPoints: 0 // Initialize total points as needed
        };

        // Update tournament teams and points table
        tournament.teams.push(player.team._id);
        tournament.pointsTable.push(pointsEntry);
        await tournament.save();

        player.tournaments.push({ tournament: tournament._id, won: false });
        await player.save();

        return res.status(200).json({ message: 'Successfully joined the tournament' });
    } catch (error) {
        console.error("Error joining tournament:", error);
        return res.status(500).json({ message: 'Server error', error });
    }
};


// Update username
exports.updateUsername = async (req, res) => {
    const { username } = req.body;

    const { _id } = req.user;

    try {
        const player = await Player.findOne({ _id });
        if (!player) {
            return res.status(404).json({ message: 'Player not found' });
        }

        const existingPlayer = await Player.findOne({ username: username });
        if (existingPlayer) {
            return res.status(400).json({ message: 'Username already taken' });
        }

        player.username = username;
        await player.save();

        res.status(200).redirect('/dashboard');
    } catch (error) {
        console.error('Error updating username:', error);
        res.status(500).json({ error: 'Error updating username', details: error.message });
    }
};

// Update password
exports.updatePassword = async (req, res) => {
    const { currentPassword, newPassword } = req.body;
    const { _id } = req.user;

    console.log('Updating password for:', _id); 
    try {
        const player = await Player.findOne({ _id });
        if (!player) {
            return res.status(404).json({ message: 'Player not found' });
        }

        const isMatch = await bcrypt.compare(currentPassword, player.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Current password is incorrect' });
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);
        player.password = hashedPassword;
        await player.save();

        res.status(200).redirect('/dashboard');
    } catch (error) {
        console.error('Error updating password:', error);
        res.status(500).json({ error: 'Error updating password', details: error.message });
    }
};

// Update email
exports.updateEmail = async (req, res) => {
    const { email } = req.body; // Extract email from request body
    const { _id } = req.user;

    try {
        const player = await Player.findOne({ _id });
        if (!player) {
            return res.status(404).json({ message: 'Player not found' });
        }

        // Check if the email is already in use
        const existingPlayer = await Player.findOne({ email });
        if (existingPlayer) {
            return res.status(400).json({ message: 'Email already taken' });
        }

        player.email = email; // Update the player's email
        await player.save();

        res.status(200).redirect('/dashboard');
    } catch (error) {
        console.error('Error updating email:', error);
        res.status(500).json({ error: 'Error updating email', details: error.message });
    }
};



exports.updateProfile = async (req, res) => {
    const { username, email, currentPassword, newPassword } = req.body;
    console.log("rithvik hot" ,req.body);
    const userId = req.user._id; // Ensure you have the user's ID from the JWT

    try {
        const player = await Player.findById(userId);
        console.log("helooasd i want player : " ,player);
        
        if (!player) {
            return res.status(404).json({ message: 'User not found' });
        }

        // // Log to check the incoming data
        // console.log('Incoming data:', req.body);
        // console.log('Fetched Player:', player);

        console.log(currentPassword);

        // Check if currentPassword is provided
        if (!currentPassword) {
            return res.status(400).json({ message: 'Current password is required' });
        }

        // Compare the provided current password with the stored hashed password
        const match = await bcrypt.compare(currentPassword, player.password);
        if (!match) {
            return res.status(401).json({ message: 'Current password is incorrect' });
        }

        // Update username and email
        player.username = username;
        player.email = email;

        // If a new password is provided, hash it and update
        if (newPassword) {
            player.password = await bcrypt.hash(newPassword, 10);
        }

        // Save the updated player information
        await player.save();

        res.status(200).json({ message: 'Profile updated successfully' });
    } catch (error) {
        console.error('Error updating profile:', error);
        res.status(500).json({ message: 'Server error' });
    }
};


exports.getEnrolledTournaments = async (req, res) => {
    const { _id } = req.user;

    try {
        const player = await Player.findById({ _id });
        if (!player) {
            return res.status(404).json({ message: 'Player not found' });
        }

        // Fetch the tournament details for enrolled tournaments with status 'Approved'
        const tournaments = await Tournament.find({
            _id: { $in: player.tournaments.map(t => t.tournament) }, // Assuming 'tournaments' array holds tournament IDs
            status: 'Approved'
        });

        return res.status(200).json({ enrolledTournaments: tournaments });
    } catch (error) {
        console.error("Error retrieving enrolled tournaments:", error);
        return res.status(500).json({ message: 'Server error', error });
    }
};

exports.getEnrolledTeams = async (req, res) => {
    const { _id } = req.user;
}


// Fetch number of tournaments played by the player
exports.getTournamentsPlayed = async (req, res) => {
    const { _id } = req.user;
    try {
        const player = await Player.findById( { _id } );

        console.log('Player ID from token:', { _id });

        if (!player) {
            return res.status(404).json({ message: 'Player not found' });
        }

        const tournamentsPlayed = player.tournaments.length;
        res.status(200).json({ tournamentsPlayed });
    } catch (error) {
        console.error('Error fetching tournaments played:', error);
        res.status(500).json({ error: 'Error fetching tournaments played' });
    }
};

// Fetch number of tournaments won by the player
// backend/controllers/playerController.js
exports.getTournamentsWon = async (req, res) => {
    const { _id } = req.user;

    try {
        const player = await Player.findOne({ _id });
        if (!player) {
            return res.status(404).json({ message: 'Player not found' });
        }

        const tournamentsWon = player.tournaments.filter(t => t.won).length;
        res.status(200).json({ tournamentsWon });
    } catch (error) {
        console.error('Error fetching tournaments won:', error);
        res.status(500).json({ error: 'Error fetching tournaments won' });
    }
};

// Fetch player ranking based on the number of tournaments played
exports.getPlayerRanking = async (req, res) => {
    const { _id } = req.user;

    try {
        const player = await Player.findOne({ _id });
        if (!player) {
            return res.status(404).json({ message: 'Player not found' });
        }

        const players = await Player.find();
        const playerRanking = players.sort((a, b) => b.tournaments.length - a.tournaments.length)
                                     .findIndex(p => p._id.toString() === _id.toString()) + 1;

        res.status(200).json({ playerRanking });
    } catch (error) {
        console.error('Error fetching player ranking:', error);
        res.status(500).json({ error: 'Error fetching player ranking' });
    }
};

exports.getFollowedOrganisers = async (req, res) => {
    const { _id } = req.user;
    try {
        // Find the player by their ID
        const player = await Player.findById(_id).populate('following');

        console.log('Player ID from token:', _id);

        if (!player) {
            return res.status(404).json({ message: 'Player not found' });
        }

        const followingOrganisers = player.following;

        res.status(200).json({ followingOrganisers });
    } catch (error) {
        console.error('Error fetching organisers followed:', error);
        res.status(500).json({ error: 'Error fetching organisers followed' });
    }
};


exports.getHomePage = async (req, res) => {
    res.status(200).render('homepage'); 
};


exports.getTournamentPointsTable = async (req, res) => {
    const { tournamentId } = req.params;

    try {
        const tournament = await Tournament.findById(tournamentId).select('name pointsTable');
        if (!tournament) {
            return res.status(404).json({ message: 'Tournament not found' });
        }

        res.render('pointsTable', { pointsTable: tournament.pointsTable });
    } catch (error) {
        return res.status(500).json({ message: 'Internal server error', error });
    }
};



exports.getDashboard = async (req, res) => {
    const _id = req.user._id;
    try {
        const player = await Player.findById(_id);
        if (!player) {
            return res.status(404).json({ message: 'Player not found' });
        }

        const winPercentage = player.tournamentsPlayed
            ? (player.tournamentsWon / player.tournamentsPlayed) * 100
            : 0;

        
        res.render('dashboard', {  // No leading slash
            player: {
                username: player.username,
                email: player.email,
                globalRank: player.globalRank || 'Unranked',
                tournamentsWon: player.tournamentsWon || 0,
                tournamentsPlayed: player.tournamentsPlayed || 0,
                noOfOrgsFollowing: player.following.length || 0,
                teamName: player.team?.name || 'Not in a team',
                winPercentage: winPercentage.toFixed(2),
            }
        });
        
    } catch (error) {
        res.status(500).json({ error: 'Error fetching dashboard' });
    }
};


