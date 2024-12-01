const Tournament = require('../models/Tournament');
const Player = require('../models/Player');
const Organiser = require('../models/Organiser');
const team = require('../models/Team');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const Team = require('../models/Team');

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

        // Check if player is already following this organiser
        if (player.following.includes(organiserId)) {
            return res.status(202).json({ message: 'Player is already following this organiser', player, organiser });
        }

       
        player.following.push(organiserId);
        await player.save();

      
        organiser.followers.push(player._id);
        await organiser.save();

        res.status(200).json({ message: 'Player successfully followed the organiser', player, organiser });
    } catch (error) {
        res.status(500).json({ error: 'Error following organiser' });
    }
};

// Func: Unfollow Organisation
exports.unfollowOrganiser = async (req, res) => {
    const { organiserId } = req.body;
    const { _id: playerId } = req.user; 

    try {
        const player = await Player.findById(playerId);
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

        organiser.followers.pull(playerId);
        await organiser.save();

        res.status(200).json({ message: 'Player successfully unfollowed the organiser', player, organiser });
    } catch (error) {
        console.error('Error unfollowing organiser:', error);
        res.status(500).json({ error: 'Error unfollowing organiser', details: error.message });
    }
};

// Func: Search tournaments by tid or name
exports.searchTournaments = async (req, res) => {
    try {
        const { searchTerm } = req.query || '';
        console.log('Search Term:', searchTerm); 
        let tournaments = [];
        let joinedTournaments = [];

        if (searchTerm) {
            const searchConditions = [];

            // Check if searchTerm is a valid number for tid
            if (!isNaN(searchTerm)) {
                searchConditions.push({ tid: Number(searchTerm) }); // Exact match for tid
            }

            // Use regex for name field
            searchConditions.push({ name: new RegExp(searchTerm, 'i') });

            tournaments = await Tournament.find({
                $and: [
                    { $or: searchConditions }, // Match either tid or name
                    { status: 'Approved' },   // Filter by status
                ],
            });
        }

        if (req.user && req.user._id) {
            const player = await Player.findById(req.user._id).populate(
                'tournaments.tournament'
            );
            if (player) {
                joinedTournaments = player.tournaments.map((t) => t.tournament);
            }
        }

        console.log('Tournaments Found:', tournaments); 
        console.log('Joined Tournaments:', joinedTournaments); 
      
        res.status(200).json({
            message: 'Tournaments fetched successfully',
            results: tournaments,
            searchTerm: searchTerm || '',
            joinedTournaments: joinedTournaments || [],
        });
    } catch (error) {
        console.error('Error searching tournaments:', error);
        res.status(500).json({
            error: 'Error searching tournaments',
            details: error.message,
        });
    }
};


exports.searchPlayer = async (req, res) => {
    try {
        const { searchTerm } = req.query; // No fallback to an empty string here
        console.log('Search Term:', searchTerm); 

        if (!searchTerm) {
            return res.status(400).json({ error: 'Search term is required.' });
        }

        const players = await Player.find({
            $or: [
                { username: new RegExp(searchTerm, 'i') },
                { email: new RegExp(searchTerm, 'i') }
            ]
        }).populate('team').populate('tournaments.tournament');

        console.log('Players Found:', players); 

        res.status(200).json({
            results: players, 
            searchTerm,
        });
        
    } catch (error) {
        console.error('Error searching players:', error); 
        res.status(500).json({
            error: 'Error searching players',
            details: error.message,
        });
    }
};



// Func: Join Tournament
exports.joinTournament = async (req, res) => {
    const { tournamentId } = req.body;
    const { _id } = req.user;

    try {
        const player = await Player.findOne({ _id }).populate('team');
        if (!player) {
            return res.status(404).json({ error: 'Player not found' });
        }

        if (!player.team) {
            return res.status(400).json({ error: 'Player must be part of a team' });
        }

        const tournament = await Tournament.findById(tournamentId);
        if (!tournament) {
            return res.status(404).json({ error: 'Tournament not found' });
        }

        if (tournament.teams.includes(player.team._id)) {
            return res.status(400).json({ error: 'Team is already registered for this tournament' });
        }

        tournament.teams.push(player.team._id);
        await tournament.save();

        player.tournaments.push({ tournament: tournament._id, won: false });
        await player.save();

        const pointsEntry = {
            ranking: tournament.pointsTable.length + 1, 
            teamName: player.team.name, 
            totalPoints: 0, // Initialize total points to 0
        };

        tournament.pointsTable.push(pointsEntry);

        await tournament.save();

        const joinedTournaments = await Tournament.find({ teams: player.team._id });

        res.status(200).json({
            message: 'Player successfully joined the tournament',
            player,
            tournament,
            joinedTournaments: joinedTournaments || []
        });
        
    } catch (error) {
        console.error("Error joining tournament:", error);
        return res.status(500).json({
            error: 'Server error',
            details: error.message,
        });
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

        res.status(200).json({
            message: 'Username updated successfully',
            player
        });
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

        res.status(200).json({
            message: 'Password updated successfully',
            player
        });
    } catch (error) {
        console.error('Error updating password:', error);
        res.status(500).json({ error: 'Error updating password', details: error.message });
    }
};
// Update email
exports.updateEmail = async (req, res) => {
    const { email } = req.body; 
    const { _id } = req.user;

    try {
        const player = await Player.findOne({ _id });
        if (!player) {
            return res.status(404).json({ message: 'Player not found' });
        }

        const existingPlayer = await Player.findOne({ email });
        if (existingPlayer) {
            return res.status(400).json({ message: 'Email already taken' });
        }

        player.email = email; 
        await player.save();

        res.status(200).json({
            message: 'Email updated successfully',
            player
        });
    } catch (error) {
        console.error('Error updating email:', error);
        res.status(500).json({ error: 'Error updating email', details: error.message });
    }
};

// Update profile
exports.updateProfile = async (req, res) => {
    const { username, email, currentPassword, newPassword } = req.body;
    const userId = req.user._id; // Ensure you have the user's ID from the JWT

    try {
        const player = await Player.findById(userId);
        if (!player) {
            return res.status(404).json({ message: 'User not found' });
        }

        
        if (!currentPassword) {
            return res.status(400).json({ message: 'Current password is required' });
        }

      
        const match = await bcrypt.compare(currentPassword, player.password);
        if (!match) {
            return res.status(401).json({ message: 'Current password is incorrect' });
        }

     
        player.username = username;
        player.email = email;

       
        if (newPassword) {
            player.password = await bcrypt.hash(newPassword, 10);
        }

        await player.save();

        res.status(200).json({
            message: 'Profile updated successfully',
            player
        });
    } catch (error) {
        console.error('Error updating profile:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Fetch number of tournaments played by the player
exports.getTournamentsPlayed = async (req, res) => {
    const { _id } = req.user;
    try {
        const player = await Player.findById({ _id });

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

exports.getFollowedOrganisers = async (req, res) => {
    const { _id } = req.user;
    try {
        // Find the player by their ID
        const player = await Player.findById(_id).populate('following');

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

// Example route for search results rendering the homepage
exports.getHomePage = async (req, res) => {
    try {
        const tournaments = await Tournament.find().catch(err => {
            console.error('Error fetching tournaments:', err);
            return [];
        });

        const players = await Player.find().catch(err => {
            console.error('Error fetching players:', err);
            return [];
        });

        const organisers = await Organiser.find().catch(err => {
            console.error('Error fetching organisers:', err);
            return [];
        });

        let followedOrganisers = [];
        let joinedTournaments = [];

        const playerName = req.user?.username || 'Guest';
        
        if (req.user && req.user._id) {
            const { _id } = req.user;

            const player = await Player.findById(_id)
                .populate({
                    path: 'following',
                    model: 'Organiser',
                    populate: {
                        path: 'tournaments',
                        model: 'Tournament'
                    }
                })
                .populate('team')
                .catch(err => {
                    console.error('Error fetching player data:', err);
                    return null;
                });

            if (player) {
                followedOrganisers = player.following || [];

                const team = player.team;
                if (team) {
                    joinedTournaments = await Tournament.find({ teams: team._id })
                        .catch(err => {
                            console.error('Error fetching tournaments for team:', err);
                            return [];
                        });
                }
            }
        }

        res.status(200).json({
            tournaments,
            players,
            organisers,
            followedOrganisers,
            joinedTournaments,
            playerName
        });
    } catch (error) {
        console.error('Error in getHomePage:', error);
        res.status(500).json({
            statusCode: '500',
            errorMessage: 'Error fetching data for the homepage'
        });
    }
};

exports.getTournamentPointsTable = async (req, res) => {
    const { tournamentId } = req.params;

    try {
        const tournament = await Tournament.findById(tournamentId).select('name pointsTable');
        if (!tournament) {
            return res.status(404).json({ message: 'Tournament not found' });
        }   
        
        res.status(200).json({
            pointsTable: tournament.pointsTable,
            tournamentName: tournament.name
        });
    } catch (error) {
        return res.status(500).json({
            message: 'Internal server error',
            error
        });
    }
};

exports.getDashboard = async (req, res) => {
    const _id = req.user._id;
    const currentDate = new Date();
    try {
        const player = await Player.findById(_id).populate('tournaments.tournament');
        if (!player) {
            return res.status(404).json({ message: 'Player not found' });
        }

        const tournamentsWon = player.tournaments.filter(t => t.won).length;
        const tournamentsPlayed = player.tournaments.length;

        let winPercentage = 0;
        if (tournamentsPlayed != 0) {
            winPercentage = (tournamentsWon / tournamentsPlayed) * 100;
        }

        const ongoingTournaments = player.tournaments.filter(t => {
            const tournament = t.tournament;
            return tournament && currentDate >= tournament.startDate && currentDate <= tournament.endDate;
        }).length;

        const teamId = player.team; 
        const team = await Team.findById(teamId); 

        res.status(200).json({
            player: {
                username: player.username,
                email: player.email,
                globalRank: player.globalRank || 'Unranked',
                tournamentsWon: tournamentsWon || 0,
                tournamentsPlayed: tournamentsPlayed || 0,
                noOfOrgsFollowing: player.following.length || 0,
                team,
                winPercentage: winPercentage.toFixed(2),
                ongoingTournaments,
            }
        });

    } catch (error) {
        console.error("Error fetching dashboard:", error.message);  
        res.status(500).json({ error: 'Error fetching dashboard', details: error.message });
    }
};

