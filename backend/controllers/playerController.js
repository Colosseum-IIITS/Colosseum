const Tournament = require('../models/Tournament');
const Player = require('../models/Player');
const Organiser = require('../models/Organiser');
const team = require('../models/Team');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const Team = require('../models/Team');

const mongoose = require('mongoose');
const { ObjectId } = mongoose.Types;

exports.followOrganiser = async (req, res) => {
    const { organiserId } = req.body;
    const { _id } = req.user;

    try {
        if (typeof organiserId !== 'string') {
            return res.status(400).json({ message: 'organiserId is not a string' });
        }

        if (!ObjectId.isValid(organiserId)) {
            return res.status(400).json({ message: 'Invalid organiser ID format' });
        }

        const organiser = await Organiser.findById(new ObjectId(organiserId));
        if (!organiser) {
            return res.status(404).json({ message: 'Organiser not found' });
        }

        const player = await Player.findById(_id);
        if (!player) {
            return res.status(404).json({ message: 'Player not found' });
        }

        if (player.following.includes(organiserId)) {
            return res.status(202).json({ message: 'Player is already following this organiser', player, organiser });
        }

        player.following.push(organiserId);
        await player.save();

        organiser.followers.push(player._id);
        await organiser.save();

        res.status(200).json({ message: 'Player successfully followed the organiser', player, organiser });

    } catch (error) {
        console.error('Error:', error.message); // Log the error for debugging
        res.status(500).json({ message: 'Error following organiser', error: error.message });
    }
};

exports.unfollowOrganiser = async (req, res) => {
    const { organiserId } = req.body;
    const { _id: playerId } = req.user; 

    try {
        // Ensure organiserId is a string
        if (typeof organiserId !== 'string') {
            return res.status(400).json({ message: 'organiserId is not a string' });
        }

        // Check if organiserId is a valid MongoDB ObjectId
        if (!ObjectId.isValid(organiserId)) {
            return res.status(400).json({ message: 'Invalid organiser ID format' });
        }

        // Use new ObjectId() to convert organiserId to a valid ObjectId
        const organiser = await Organiser.findById(new ObjectId(organiserId));
        if (!organiser) {
            return res.status(404).json({ message: 'Organiser not found' });
        }

        const player = await Player.findById(playerId);
        if (!player) {
            return res.status(404).json({ message: 'Player not found' });
        }

        // Check if the player is following the organiser
        if (!player.following.includes(organiserId)) {
            return res.status(400).json({ message: 'Player is not following this organiser' });
        }

        // Unfollow the organiser
        player.following.pull(organiserId);
        await player.save();

        // Remove the player from the organiser's followers
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
    const { tournamentId } = req.params;  // Tournament ID passed in URL
    const { _id } = req.user;  // Player's ID from authenticated user
  
    try {
        const player = await Player.findOne({ _id }).populate('team');
        if (!player) {
            return res.status(404).json({ message: 'Player not found' });
        }
  
        if (!player.team) {
            return res.status(400).json({ message: 'Player must be part of a team' });
        }
      
        const tournament = await Tournament.findOne({ _id: mongoose.Types.ObjectId(tournamentId) });
  
        if (!tournament) {
            return res.status(404).json({ message: 'Tournament not found' });
        }
  
        if (tournament.teams.includes(player.team._id)) {
            return res.status(400).json({ message: 'Team is already registered for this tournament' });
        }

        // Add the team to the pointsTable with an initial score of 0
        tournament.pointsTable.push({
            ranking: tournament.pointsTable.length + 1,  // New ranking based on existing table size
            teamName: player.team.name,  // Assuming `name` is the team's name field
            totalPoints: 0  // Default points for new team
        });

        tournament.teams.push(player.team._id);
        await tournament.save();
      
        const team = await Team.findById(player.team._id);
        team.tournaments.push(tournament._id);
        await team.save();
      
        player.tournaments.push({ tournament: tournament._id, won: false });
        await player.save();
  
        return res.status(200).json({ message: 'Successfully joined the tournament' });
    } catch (error) {
        console.error("Error joining tournament:", error);
        return res.status(500).json({ message: 'Server error', error });
    }
};



exports.updateUsername = async (req, res) => {
    try {
        const { username } = req.body;

        if (!username || typeof username !== 'string' || !username.trim()) {
            return res.status(400).json({ error: 'Username is required and cannot be empty' });
        }
        
        const { _id } = req.user;

        const player = await Player.findById(_id);
        if (!player) {
            return res.status(404).json({ error: 'Player not found' });
        }

        const existingPlayer = await Player.findOne({ username });
        if (existingPlayer) {
            return res.status(400).json({ error: 'Username already taken' });
        }

        player.username = username;
        await player.save();

        res.status(200).json({
            message: 'Username updated successfully',
            player,
        });
    } catch (error) {
        console.error('Error updating username:', error);
        res.status(500).json({
            error: 'Error updating username',
            details: error.message,
        });
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
    console.log('User ID:', _id); // Log user ID to confirm it's correct
  
    try {
      const player = await Player.findOne({ _id });
      if (!player) {
        return res.status(404).json({ message: 'Player not found' });
      }
  
      const tournamentsWon = player.tournaments.filter(t => t.won).length;
      console.log('Tournaments Won:', tournamentsWon); // Log the result
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
    const playerId = req.user._id;
    const currentDate = new Date();
    
    try {
      const player = await Player.findById(playerId).populate('tournaments.tournament');
      if (!player) {
        return res.status(404).json({ message: 'Player not found' });
      }
  
      const tournamentsWon = player.tournaments.filter(t => t.won).length;
      const tournamentsPlayed = player.tournaments.length;
  
      let winPercentage = 0;
      if (tournamentsPlayed !== 0) {
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
  

exports.getUsername = async (req, res) => {
    try {
        const { _id } = req.user;  // Extract the _id from the authenticated user

        // Fetch the player from the database
        const player = await Player.findById(_id);
        
        if (!player) {
            return res.status(404).json({ message: 'Player not found' });
        }

        // Respond with the player's username
        res.status(200).json({
            username: player.username,
        });

    } catch (error) {
        // Enhanced error logging for better debugging
        console.error('Error fetching username:', error);

        res.status(500).json({
            error: 'Error fetching username',
            details: error.message,
        });
    }
};

exports.getPlayerProfile = async (req, res) => {
    try {
      // Ensure the user is authenticated and their ID is availableF
      const playerId = req.user?.id;
  
      if (!playerId) {
        return res.status(400).json({ message: 'Authentication error: Player ID not found in request.' });
      }
  
      // Search the database for the player based on the player ID
      const player = await Player.findById(playerId)
        .populate('team')               // Populate team details
        .populate('following')          // Populate following details
        .populate('tournaments.tournament') // Populate tournament details
        .exec();
  
      // Check if the player exists
      if (!player) {
        return res.status(404).json({ message: 'Player not found' });
      }
  
      // Ensure following and tournaments are arrays to avoid errors when mapping
      const following = player.following ? player.following.map(org => org.username) : [];
      const tournaments = player.tournaments ? player.tournaments.map(t => ({
        tournament: t.tournament?.name || 'Unknown tournament',
        won: t.won,
      })) : [];
  
      // Respond with the player data
      res.status(200).json({
        username: player.username,
        email: player.email,
        profilePhoto: player.profilePhoto,
        team: player.team ? player.team.name : 'No team', // Include team name if available
        following,  // List of following organisers' usernames
        tournaments,  // List of tournaments with results
        banned: player.banned,
      });
    } catch (error) {
      // Enhanced error logging for better debugging
      console.error('Error fetching player profile:', error);
  
      // Respond with a detailed error message
      res.status(500).json({
        error: 'Server error',
        details: error.message,
      });
    }
  };
<<<<<<< Updated upstream
  exports.getWinPercentage = async (req, res) => {
    try {
      const playerId = req.user.id; // Assuming you have user authentication and user ID is stored in req.user
  
      // Find player by their ID (you may want to adjust this based on your model schema)
      const player = await Player.findById(playerId);
  
      if (!player) {
        return res.status(404).json({ message: 'Player not found' });
      }
  
      // Calculate win percentage
      const totalTournaments = player.tournamentsPlayed; // Assuming the model has this field
      const tournamentsWon = player.tournamentsWon; // Assuming the model has this field
  
      // If no tournaments were played, return winPercentage as 0
      if (totalTournaments === 0 || tournamentsWon === 0) {
        return res.status(200).json({ winPercentage: 0 });
      }
  
      // Calculate win percentage (ensure it's not null)
      const winPercentage = (tournamentsWon / totalTournaments) * 100 || 0;
  
      return res.status(200).json({ winPercentage });
    } catch (error) {
      console.error('Error fetching win percentage:', error);
      return res.status(500).json({ message: 'Internal Server Error' });
    }
  };
=======
  
  exports.updateProfilePicture = async (req, res) => {
    try {
      console.log('Incoming request to update profile picture'); // Log the incoming request
  
      const playerId = req.user.id; // Extract the player ID from the authenticated user
      console.log(`Player ID: ${playerId}`); // Log the player ID
  
      const file = req.file; // File is uploaded via multer middleware
      console.log('File received:', file); // Log the received file
  
      if (!file) {
        return res.status(400).json({ message: "No file uploaded" });
      }
  
      // Convert file to Base64 string
      const base64Image = `data:${file.mimetype};base64,${file.buffer.toString("base64")}`;
      console.log('Base64 image generated'); // Log when the Base64 string is generated
  
      // Update the player's profile photo in the database
      const updatedPlayer = await Player.findByIdAndUpdate(
        playerId,
        { profilePhoto: { data: base64Image, contentType: file.mimetype } },
        { new: true }
      );
      console.log('Updated player:', updatedPlayer); // Log the updated player object
  
      if (!updatedPlayer) {
        return res.status(404).json({ message: "Player not found" });
      }
  
      res.status(200).json({
        message: "Profile photo updated successfully",
        profilePhoto: updatedPlayer.profilePhoto,
      });
    } catch (error) {
      console.error("Error updating profile picture:", error); // Log the error
      res.status(500).json({ message: "An error occurred", error: error.message });
    }
  };
  
  
  // Get Player's Profile Picture (GET)
  exports.getProfilePicture = async (req, res) => {
    try {
      console.log('Incoming request to get profile picture'); // Log the incoming request
  
      const playerId = req.user.id; // Extract the player ID from the authenticated user
      console.log(`Player ID: ${playerId}`); // Log the player ID
  
      // Find the player in the database
      const player = await Player.findById(playerId);
      console.log('Player found:', player.profilePhoto); // Log the retrieved player data
  
      if (!player || !player.profilePhoto) {
        return res.status(404).json({ message: "Player or profile photo not found" });
      }
  
      // Send the profile photo as a response (Base64)
      res.status(200).json({
        profilePhoto: player.profilePhoto,
      });
    } catch (error) {
      console.error("Error fetching profile picture:", error); // Log the error
      res.status(500).json({ message: "An error occurred", error: error.message });
    }
  };
  
  
>>>>>>> Stashed changes
