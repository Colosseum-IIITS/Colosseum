const Tournament = require('../models/Tournament');
const Player = require('../models/Player');
const Organiser = require('../models/Organiser');
const team = require('../models/Team');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');


// Func: Follow Organisation
exports.followOrganiser = async (req, res) => {
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

        if (player.following.includes(organiserId)) {
            return res.status(400).json({ message: 'Player is already following this organiser' });
        }

        player.following.push(organiserId);
        await player.save();

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

        const tournaments = await Tournament.find({
            $or: [
                { tid: new RegExp(searchTerm, 'i') },
                { name: new RegExp(searchTerm, 'i') }
            ]
        });

        console.log('Tournaments Found:', tournaments); // Debugging line

        if (!tournaments || tournaments.length === 0) {
            return res.status(404).json({ message: 'No tournaments found' });
        }
        res.status(200).json(tournaments);
    } catch (error) {
        console.error('Error searching tournaments:', error); // Log the error
        res.status(500).json({ error: 'Error searching tournaments' });
    }
};








// Func: Join Tournament
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

        if (tournament.teams.includes(player.team._id)) {
            return res.status(400).json({ message: 'Team is already registered for this tournament' });
        }

        tournament.teams.push(player.team._id);
        await tournament.save();

        player.tournaments.push({ tournament: tournament._id, won: false });
        await player.save();

        return res.status(200).json({ message: 'Successfully joined the tournament' });
    } catch (error) {
        return res.status(500).json({ message: 'Server error', error });
    }
};

// Update username
exports.updateUsername = async (req, res) => {
    const { newUsername } = req.body;
    const { _id } = req.user;

    try {
        const player = await Player.findOne({ _id });
        if (!player) {
            return res.status(404).json({ message: 'Player not found' });
        }

        const existingPlayer = await Player.findOne({ username: newUsername });
        if (existingPlayer) {
            return res.status(400).json({ message: 'Username already taken' });
        }

        player.username = newUsername;
        await player.save();

        res.status(200).json({ message: 'Username updated successfully', player });
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

        res.status(200).json({ message: 'Password updated successfully' });
    } catch (error) {
        console.error('Error updating password:', error);
        res.status(500).json({ error: 'Error updating password', details: error.message });
    }
};

// Update email
exports.updateEmail = async (req, res) => {
    const { newEmail } = req.body;
    const { _id } = req.user;

    try {
        const player = await Player.findOne({ _id });
        if (!player) {
            return res.status(404).json({ message: 'Player not found' });
        }

        const existingEmail = await Player.findOne({ email: newEmail });
        if (existingEmail) {
            return res.status(400).json({ message: 'Email is already in use' });
        }

        player.email = newEmail;
        await player.save();
        res.status(200).json({ message: 'Email updated successfully' });
    } catch (error) {
        console.log('Error updating email:', error);
        res.status(500).json({ error: 'Error updating email', details: error.message });
    }
};

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



