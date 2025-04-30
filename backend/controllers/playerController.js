const Tournament = require('../models/Tournament');
const Player = require('../models/Player');
const Organiser = require('../models/Organiser');
const team = require('../models/Team');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const Team = require('../models/Team');
const mongoose = require('mongoose');  
const { delCache, setCache } = require('../utils/redisClient');  
const{getCache}=require('../utils/redisClient');
exports.followOrganiser = async (req, res) => {
    const { organiserId } = req.body;
    const { _id: playerId } = req.user;

    try {
        // Ensure organiserId is a string
        if (typeof organiserId !== 'string') {
            return res.status(400).json({ message: 'organiserId is not a string' });
        }

        // Check if organiserId is a valid MongoDB ObjectId
        if (!mongoose.Types.ObjectId.isValid(organiserId)) {
            return res.status(400).json({ message: 'Invalid organiser ID format' });
        }

        // Use mongoose.Types.ObjectId() to convert organiserId to a valid ObjectId
        const organiser = await Organiser.findById(organiserId);
        if (!organiser) {
            return res.status(404).json({ message: 'Organiser not found' });
        }

        const player = await Player.findById(playerId);
        if (!player) {
            return res.status(404).json({ message: 'Player not found' });
        }

        // Check if the player is already following the organiser
        if (player.following.includes(organiserId)) {
            return res.status(400).json({ message: 'Player is already following this organiser' });
        }

        // Follow the organiser
        player.following.push(organiserId);
        await player.save();

        // Add the player to the organiser's followers
        organiser.followers.push(playerId);
        await organiser.save();

        res.status(200).json({ message: 'Player successfully followed the organiser', player, organiser });

    } catch (error) {
        console.error('Error following organiser:', error);
        res.status(500).json({ error: 'Error following organiser', details: error.message });
    }
};



// Import mongoose for ObjectId
exports.unfollowOrganiser = async (req, res) => {
    const { organiserId } = req.body;
    const { _id: playerId } = req.user; 

    try {
        // Ensure organiserId is a string
        if (typeof organiserId !== 'string') {
            return res.status(400).json({ message: 'organiserId is not a string' });
        }

        // Check if organiserId is a valid MongoDB ObjectId
        if (!mongoose.Types.ObjectId.isValid(organiserId)) {
            return res.status(400).json({ message: 'Invalid organiser ID format' });
        }

        // Use mongoose.Types.ObjectId() to convert organiserId to a valid ObjectId
        const organiser = await Organiser.findById(organiserId);
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
        const { searchTerm, page = 1, limit = 10 } = req.query;
        const skip = (page - 1) * limit;
        console.log('Search Term:', searchTerm); 
        let tournaments = [];
        let joinedTournaments = [];
        let totalCount = 0;

        if (searchTerm) {
            const searchConditions = [];

            // Check if searchTerm is a valid number for tid
            if (!isNaN(searchTerm)) {
                searchConditions.push({ tid: Number(searchTerm) }); // Exact match for tid
            }

            // Use regex for name field
            searchConditions.push({ name: new RegExp(searchTerm, 'i') });

            // Count total results for pagination info
            totalCount = await Tournament.countDocuments({
                $and: [
                    { $or: searchConditions },
                    { status: 'Approved' },
                ],
            }).lean();

            // Get paginated results with projection
            tournaments = await Tournament.find({
                $and: [
                    { $or: searchConditions }, // Match either tid or name
                    { status: 'Approved' },   // Filter by status
                ],
            })
            .select('tid name startDate endDate entryFee prizePool organiser') // Select only needed fields
            .skip(skip)
            .limit(parseInt(limit))
            .lean(); // Use lean for better performance
        }

        if (req.user && req.user._id) {
            const player = await Player.findById(req.user._id)
                .select('tournaments.tournament')
                .populate({
                    path: 'tournaments.tournament',
                    select: '_id' // Only need the IDs to check participation
                })
                .lean();
                
            if (player) {
                joinedTournaments = player.tournaments.map((t) => t.tournament);
            }
        }

        res.status(200).json({
            message: 'Tournaments fetched successfully',
            results: tournaments,
            searchTerm: searchTerm || '',
            joinedTournaments: joinedTournaments || [],
            pagination: {
                total: totalCount,
                page: parseInt(page),
                limit: parseInt(limit),
                pages: Math.ceil(totalCount / limit)
            }
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
        const { searchTerm, page = 1, limit = 10 } = req.query;
        const skip = (page - 1) * limit;
        console.log('Search Term:', searchTerm); 

        let totalCount = 0;
        let players = [];

        if (!searchTerm || searchTerm.trim() === '') {
            // Count total players for pagination
            totalCount = await Player.countDocuments({ banned: false }).lean();
            
            // Get paginated results with needed fields only
            players = await Player.find({ banned: false })
                .select('username email team tournaments.tournament profilePhoto')
                .populate({ path: 'team', select: 'name' })
                .populate({ path: 'tournaments.tournament', select: 'name startDate' })
                .skip(skip)
                .limit(parseInt(limit))
                .lean();
        } else {
            // Count total results for pagination
            totalCount = await Player.countDocuments({
                $and: [
                    { $or: [
                        { username: new RegExp(searchTerm, 'i') },
                        { email: new RegExp(searchTerm, 'i') }
                    ]},
                    { banned: false }
                ]
            }).lean();
            
            // Get paginated search results
            players = await Player.find({
                $and: [
                    { $or: [
                        { username: new RegExp(searchTerm, 'i') },
                        { email: new RegExp(searchTerm, 'i') }
                    ]},
                    { banned: false }
                ]
            })
            .select('username email team tournaments.tournament profilePhoto')
            .populate({ path: 'team', select: 'name' })
            .populate({ path: 'tournaments.tournament', select: 'name startDate' })
            .skip(skip)
            .limit(parseInt(limit))
            .lean();
        }

        console.log('Players Found:', players.length); 

        res.status(200).json({
            results: players, 
            searchTerm,
            pagination: {
                total: totalCount,
                page: parseInt(page),
                limit: parseInt(limit),
                pages: Math.ceil(totalCount / limit)
            }
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
    if (!mongoose.isValidObjectId(tournamentId)) {
        return res.status(400).json({ message: "Invalid tournament ID" });
    }
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
      
        const tournament = await Tournament.findOne({ _id: mongoose.Types.ObjectId(tournamentId) }).populate("organiser");
  
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

        // Update revenue for the tournament and organiser
        tournament.revenue += tournament.entryFee;
        await tournament.save();

        const organiser = await Organiser.findById(tournament.organiser._id);
        if (organiser) {
            organiser.totalRevenue += tournament.entryFee;
            await organiser.save();
        }
      
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

    // Invalidate the cache for both the player dashboard and username
    const dashboardCacheKey = `dashboard_${_id}`;
    const usernameCacheKey = `username_${_id}`;
    
    await delCache(dashboardCacheKey);  // Remove cached dashboard data
    await delCache(usernameCacheKey);   // Remove cached username data

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

      // Check if the current password matches the stored password
      const isMatch = await bcrypt.compare(currentPassword, player.password);
      if (!isMatch) {
          return res.status(400).json({ message: 'Current password is incorrect' });
      }

      // Hash and update the password
      const hashedPassword = await bcrypt.hash(newPassword, 10);
      player.password = hashedPassword;
      await player.save();

      // Invalidate the relevant cache after updating the password
      const dashboardCacheKey = `dashboard_${_id}`;
      const usernameCacheKey = `username_${_id}`;

      await delCache(dashboardCacheKey);  // Remove cached dashboard data
      await delCache(usernameCacheKey);   // Remove cached username data

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

      // Check if the email is already taken by another player
      const existingPlayer = await Player.findOne({ email });
      if (existingPlayer) {
          return res.status(400).json({ message: 'Email already taken' });
      }

      // Update the player's email
      player.email = email; 
      await player.save();

      // Invalidate the relevant cache after updating the email
      const dashboardCacheKey = `dashboard_${_id}`;
      const usernameCacheKey = `username_${_id}`;

      await delCache(dashboardCacheKey);  // Remove cached dashboard data
      await delCache(usernameCacheKey);   // Remove cached username data

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

exports.getTournamentsPlayed = async (req, res) => {
  const { _id } = req.user;

  try {
    // Check cache first
    const cacheKey = `player_tournaments_played_${_id}`;
    const cacheValue = await getCache(cacheKey);
    if (cacheValue) {
      console.log(`Cache hit for player ${_id}`);
      return res.status(200).json({ tournamentsPlayed: cacheValue });
    }

    // If not in cache, fetch from database
    const player = await Player.findById({ _id });

    if (!player) {
      return res.status(404).json({ message: 'Player not found' });
    }

    const tournamentsPlayed = player.tournaments.length;

    // Store the result in cache for 30 minutes (1800 seconds)
    await setCache(cacheKey, tournamentsPlayed, 1800);

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
    // Check cache first
    const cacheKey = `player_tournaments_won_${_id}`;
    const cacheValue = await getCache(cacheKey);
    if (cacheValue) {
      console.log(`Cache hit for player ${_id}`);
      return res.status(200).json({ tournamentsWon: cacheValue });
    }

    console.log(`Cache miss for player ${_id}, fetching from DB...`);

    // If not in cache, fetch from database
    const player = await Player.findOne({ _id });
    if (!player) {
      return res.status(404).json({ message: 'Player not found' });
    }

    const tournamentsWon = player.tournaments.filter(t => t.won).length;
    console.log('Tournaments Won:', tournamentsWon); // Log the result

    // Cache the result for 30 minutes (1800 seconds)
    await setCache(cacheKey, tournamentsWon, 1800);

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
    // Check cache first
    const cacheKey = `player_ranking_${_id}`;
    const cacheValue = await getCache(cacheKey);
    if (cacheValue) {
      console.log(`Cache hit for player ranking ${_id}`);
      return res.status(200).json({ playerRanking: cacheValue });
    }

    console.log(`Cache miss for player ranking ${_id}, fetching from DB...`);

    // If not in cache, fetch the player and all players
    const player = await Player.findOne({ _id });
    if (!player) {
      return res.status(404).json({ message: 'Player not found' });
    }

    const players = await Player.find();
    // Sort players by the number of tournaments and get the rank
    const playerRanking = players
      .sort((a, b) => b.tournaments.length - a.tournaments.length)
      .findIndex(p => p._id.toString() === _id.toString()) + 1;

    console.log('Player Ranking:', playerRanking); // Log the result

    // Cache the result for 30 minutes (1800 seconds)
    await setCache(cacheKey, playerRanking, 1800);

    res.status(200).json({ playerRanking });
  } catch (error) {
    console.error('Error fetching player ranking:', error);
    res.status(500).json({ error: 'Error fetching player ranking' });
  }
};



exports.getFollowedOrganisers = async (req, res) => {
  const { _id } = req.user;

  try {
    // Check cache first
    const cacheKey = `player_followed_organisers_${_id}`;
    const cacheValue = await getCache(cacheKey);
    if (cacheValue) {
      console.log(`Cache hit for followed organisers of player ${_id}`);
      return res.status(200).json({ followingOrganisers: cacheValue });
    }

    // If not in cache, fetch from database
    const player = await Player.findById(_id).populate('following', 'name _id'); // Optional: specify fields to populate
    if (!player) {
      return res.status(404).json({ message: 'Player not found' });
    }

    const followingOrganisers = player.following;

    // Cache the result for 30 minutes (1800 seconds)
    await setCache(cacheKey, followingOrganisers, 1800);

    res.status(200).json({ followingOrganisers });
  } catch (error) {
    console.error('Error fetching organisers followed:', error);
    res.status(500).json({ error: 'Error fetching organisers followed' });
  }
};

exports.getTournamentPointsTable = async (req, res) => {
  const { tournamentId } = req.params;

  try {
    // Check cache first
    const cacheKey = `tournament_points_table_${tournamentId}`;
    const cacheValue = await getCache(cacheKey);
    if (cacheValue) {
      console.log(`Cache hit for tournament points table of tournament ${tournamentId}`);
      return res.status(200).json({
        pointsTable: cacheValue.pointsTable,
        tournamentName: cacheValue.tournamentName
      });
    }

    // If not in cache, fetch from database
    const tournament = await Tournament.findById(tournamentId).select('name pointsTable');
    if (!tournament) {
      return res.status(404).json({ message: 'Tournament not found' });
    }

    const { name, pointsTable } = tournament;

    // Cache the result for 30 minutes (1800 seconds)
    await setCache(cacheKey, { pointsTable, tournamentName: name }, 1800);

    res.status(200).json({
      pointsTable,
      tournamentName: name
    });
  } catch (error) {
    console.error('Error fetching tournament points table:', error);
    return res.status(500).json({
      message: 'Internal server error',
      error: error.message
    });
  }
};


exports.getGlobalPlayerRanking = async (req, res) => {
  try {
    const cacheKey = 'global_player_ranking'; // Use a fixed cache key for the global ranking

    // Check if the ranking is cached
    const cachedRanking = await getCache(cacheKey);
    if (cachedRanking) {
      console.log('Cache hit for global player rankings');
      return res.status(200).json(cachedRanking);
    }

    // If not cached, calculate the rankings from the database
    const players = await Player.find().lean();

    const rankedPlayers = players
      .map(player => ({
        _id: player._id,
        username: player.username,
        tournamentsWon: player.tournaments.filter(t => t.won).length,
        tournamentsPlayed: player.tournaments.length
      }))
      .sort((a, b) =>
        b.tournamentsWon - a.tournamentsWon || // Primary sorting by tournaments won
        b.tournamentsPlayed - a.tournamentsPlayed // Tiebreaker by tournaments played
      );

    // Cache the result for 30 minutes (1800 seconds)
    await setCache(cacheKey, rankedPlayers, 1800);

    res.status(200).json(rankedPlayers);
  } catch (error) {
    console.error('Error fetching player rankings:', error);
    res.status(500).json({ message: 'Error retrieving player rankings', error });
  }
};


exports.getDashboard = async (req, res) => {
  const playerId = req.user._id;
  const currentDate = new Date();
  const cacheKey = `dashboard_${playerId}`; // Unique cache key for each player

  try {
    // Check if the dashboard data is cached
    const cachedDashboard = await getCache(cacheKey);
    if (cachedDashboard) {
      console.log('Cache hit for player dashboard');
      return res.status(200).json(cachedDashboard); // Return cached data
    }

    // If not cached, proceed with the database query
    const player = await Player.findById(playerId).populate('tournaments.tournament');
    if (!player) {
      return res.status(404).json({ message: 'Player not found' });
    }

    // Calculate tournaments won and played
    const tournamentsWon = player.tournaments.filter(t => t.won).length;
    const tournamentsPlayed = player.tournaments.length;

    let winPercentage = 0;
    if (tournamentsPlayed !== 0) {
      winPercentage = (tournamentsWon / tournamentsPlayed) * 100;
    }

    // Calculate ongoing tournaments based on current date
    const ongoingTournaments = player.tournaments.filter(t => {
      const tournament = t.tournament;
      return tournament && currentDate >= tournament.startDate && currentDate <= tournament.endDate;
    }).length;

    // Get team details if exists
    const teamId = player.team;
    const team = teamId ? await Team.findById(teamId) : null;

    // Compute global rankings for all players
    const players = await Player.find().lean();
    const rankings = players
      .map(p => ({
        _id: p._id,
        username: p.username,
        tournamentsWon: p.tournaments.filter(t => t.won).length,
        tournamentsPlayed: p.tournaments.length
      }))
      .sort((a, b) =>
        b.tournamentsWon - a.tournamentsWon || // Primary: tournaments won
        b.tournamentsPlayed - a.tournamentsPlayed // Tiebreaker: tournaments played
      );

    // Find the current player's rank (1-based index)
    const globalRank = rankings.findIndex(p => p._id.toString() === playerId.toString()) + 1;

    // Prepare the dashboard response data
    const dashboardData = {
      player: {
        username: player.username,
        email: player.email,
        globalRank: globalRank || 'Unranked',
        tournamentsWon,
        tournamentsPlayed,
        noOfOrgsFollowing: player.following.length || 0,
        team,
        winPercentage: winPercentage.toFixed(2),
        ongoingTournaments,
      },
      globalRanking: rankings
    };

    // Cache the dashboard data for 30 minutes (1800 seconds)
    await setCache(cacheKey, dashboardData, 1800);

    // Return the dashboard data
    res.status(200).json(dashboardData);
  } catch (error) {
    console.error("Error fetching dashboard:", error.message);
    res.status(500).json({ error: 'Error fetching dashboard', details: error.message });
  }
};

  
exports.getUsername = async (req, res) => {
  const { _id } = req.user;  // Extract the _id from the authenticated user
  const cacheKey = `username_${_id}`; // Unique cache key for each player

  try {
    // Check if the username is cached
    const cachedUsername = await getCache(cacheKey);
    if (cachedUsername) {
      console.log('Cache hit for player username');
      return res.status(200).json(cachedUsername); // Return cached username
    }

    // If not cached, proceed with the database query
    const player = await Player.findById(_id).select('username');  // Fetch only the username field
    
    if (!player) {
      return res.status(404).json({ message: 'Player not found' });
    }

    // Prepare the response with the player's username
    const response = {
      username: player.username,
    };

    // Cache the username for 30 minutes (1800 seconds)
    await setCache(cacheKey, response, 1800);

    // Respond with the player's username
    res.status(200).json(response);

  } catch (error) {
    // Enhanced error logging for better debugging
    console.error(`Error fetching username for user ${_id}:`, error);

    res.status(500).json({
      error: 'Error fetching username',
      details: error.message,
    });
  }
};



exports.getPlayerProfile = async (req, res) => {
  try {
    const playerId = req.user?._id;

    if (!playerId) {
      return res.status(401).json({ 
        success: false,
        error: 'Authentication required' 
      });
    }

    const cacheKey = `player_profile_${playerId}`; // Unique cache key for each player's profile

    // Check if the player profile is cached
    const cachedProfile = await getCache(cacheKey);
    if (cachedProfile) {
      console.log('Cache hit for player profile');
      return res.status(200).json({
        success: true,
        data: cachedProfile, // Return cached player profile
      });
    }

    // If not cached, proceed with the database query
    const player = await Player.findById(playerId)
      .populate('team')
      .populate('teamPayment.payment')
      .populate('following')
      .populate('tournaments.tournament')
      .populate('tournaments.payment')
      .lean();

    if (!player) {
      return res.status(404).json({ 
        success: false,
        error: 'Player not found' 
      });
    }

    // Format the response data
    const profileData = {
      username: player.username,
      email: player.email,
      profilePhoto: player.profilePhoto,
      
      // Team details
      team: player.team ? {
        id: player.team._id,
        name: player.team.name
      } : null,
      
      // Team payment status
      teamPayment: {
        paid: player.teamPayment?.paid || false,
        paymentDetails: player.teamPayment?.payment ? {
          id: player.teamPayment.payment._id,
          amount: player.teamPayment.payment.amount,
          status: player.teamPayment.payment.status,
          date: player.teamPayment.payment.createdAt
        } : null
      },

      // Tournaments with payment info
      tournaments: player.tournaments?.map(t => ({
        id: t.tournament?._id,
        name: t.tournament?.name,
        won: t.won,
        payment: t.payment ? {
          id: t.payment._id,
          status: t.payment.status,
          amount: t.payment.amount
        } : null
      })) || [],

      // Following list
      following: player.following?.map(org => ({
        id: org._id,
        username: org.username
      })) || [],

      banned: player.banned,
      
      // Additional user info
      createdAt: player.createdAt,
      updatedAt: player.updatedAt
    };

    // Cache the profile data for 30 minutes (1800 seconds)
    await setCache(cacheKey, profileData, 1800);

    res.status(200).json({
      success: true,
      data: profileData
    });

  } catch (error) {
    console.error('Profile fetch error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch profile',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

  
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
  
  exports.updateProfilePicture = async (req, res) => {
    try {
      console.log('Incoming request to update profile picture');
    
      const playerId = req.user.id;
      console.log(`Player ID: ${playerId}`);
    
      const file = req.file;
      console.log('File received:', file);
    
      if (!file) {
        return res.status(400).json({ message: "No file uploaded" });
      }
    
      const base64Image = `data:${file.mimetype};base64,${file.buffer.toString("base64")}`;
      console.log('Base64 image generated');
    
      // Update the player's profile photo in the database
      const updatedPlayer = await Player.findByIdAndUpdate(
        playerId,
        { profilePhoto: { data: base64Image, contentType: file.mimetype } },
        { new: true }
      );
      console.log('Updated player:', updatedPlayer);
    
      if (!updatedPlayer) {
        return res.status(404).json({ message: "Player not found" });
      }
  
      // Invalidate cache for this player's profile picture
      await delCache(`profile_picture_${playerId}`);
    
      res.status(200).json({
        message: "Profile photo updated successfully",
        profilePhoto: updatedPlayer.profilePhoto,
      });
    } catch (error) {
      console.error("Error updating profile picture:", error);
      res.status(500).json({ message: "An error occurred", error: error.message });
    }
  };
  
  
  
  // Get Player's Profile Picture (GET)
  exports.getProfilePicture = async (req, res) => {
    try {
      console.log('Incoming request to get profile picture'); // Log the incoming request
  
      const playerId = req.user.id; // Extract the player ID from the authenticated user
      console.log(`Player ID: ${playerId}`); // Log the player ID
  
      const cacheKey = `profile_picture_${playerId}`; // Unique cache key for profile picture
  
      // Check if the profile picture is cached
      const cachedProfilePicture = await getCache(cacheKey);
      if (cachedProfilePicture) {
        console.log('Cache hit for profile picture');
        return res.status(200).json({
          profilePhoto: cachedProfilePicture, // Return cached profile photo
        });
      }
  
      // Find the player in the database
      const player = await Player.findById(playerId);
      console.log('Player found:', player?.profilePhoto); // Log the retrieved player data
  
      if (!player || !player.profilePhoto) {
        return res.status(404).json({ message: "Player or profile photo not found" });
      }
  
      // Cache the profile picture for 24 hours (86400 seconds)
      await setCache(cacheKey, player.profilePhoto, 86400);
  
      // Send the profile photo as a response (Base64 or URL)
      res.status(200).json({
        profilePhoto: player.profilePhoto,
      });
    } catch (error) {
      console.error("Error fetching profile picture:", error); // Log the error
      res.status(500).json({ message: "An error occurred", error: error.message });
    }
  };
  
  

