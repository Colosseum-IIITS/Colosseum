const Tournament = require("../models/Tournament");
const Player = require("../models/Player");
const Team = require("../models/Team");
const jwt = require('jsonwebtoken');
const Organiser = require("../models/Organiser");
const mongoose = require('mongoose');
const {delCache}=require('../utils/redisClient')
//Create a new tournament
// exports.createTournamentForm = async (req, res) => {
//     res.status(200).json({ message: "Render createTournament page", organiser: req.user });
// };

// Create a tournament.
exports.createTournament = async (req, res) => {
  const { tid, name, startDate, endDate, entryFee, prizePool, description } = req.body;
  const organiser = req.user._id;

  try {
    const existingTournament = await Tournament.findOne({ tid });
    if (existingTournament) {
      return res.status(400).json({ message: "Tournament ID already exists" });
    }

    if (new Date(startDate) >= new Date(endDate)) {
      return res.status(400).json({ message: "Start date must be earlier than end date" });
    }

    const tournament = new Tournament({
      tid,
      name,
      startDate,
      endDate,
      entryFee,
      prizePool,
      status: "Pending",
      description,
      organiser,
    });

    const savedTournament = await tournament.save();

    const organiserUpdate = await Organiser.findByIdAndUpdate(
      organiser,
      { $push: { tournaments: savedTournament._id } },
      { new: true }
    );

    if (!organiserUpdate) {
      return res.status(404).json({ message: "Organiser not found" });
    }

    // Notify all players following the organiser
    const followingPlayers = await Player.find({ following: organiser });

    followingPlayers.forEach(async (player) => {
      const message = `${organiserUpdate.username} is conducting a new tournament: ${savedTournament.name}`;
      await Player.findByIdAndUpdate(player._id, {
        $push: { notifications: { message } },
      });
    });

    // ✅ Clear cached organiser profile so tournaments update in UI
    await delCache(`organiser_name_${organiser}`);

    return res.status(200).json({
      message: "Tournament created successfully",
      tournament: savedTournament,
    });
  } catch (error) {
    console.error("Error creating tournament:", error);
    res.status(500).json({ error: "Error creating tournament" });
  }
};



exports.getNotifications = async (req, res) => {
  const playerId = req.user._id;
  
  try {
    const player = await Player.findById(playerId);
    if (!player) {
      return res.status(404).json({ message: "Player not found" });
    }

    res.status(200).json(player.notifications || []);
  } catch (error) {
    console.error('Error fetching notifications:', error);
    res.status(500).json({ error: "Error fetching notifications error at getNotification" });
  }
};


// Check if player has joined the tournament
exports.didPlayerJoin = async (req, res) => {
    try {
        const { tournamentId } = req.params;
        const playerId = req.user._id;

        const tournament = await Tournament.findById(tournamentId).populate('teams');
        if (!tournament) {
            return res.status(404).json({ message: 'Tournament not found' });
        }

        const playerInTournament = await Player.findById(playerId)
            .populate({
                path: 'team',
                match: { _id: { $in: tournament.teams } }
            });

        if (playerInTournament.team) {
            return res.status(200).json({ message: 'Player is in the tournament', joined: true });
        } else {
            return res.status(200).json({ message: 'Player is not in the tournament', joined: false });
        }
    } catch (error) {
        return res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Update an existing tournament
exports.updateTournament = async (req, res) => {
    const { tournamentId } = req.params;
    const updateData = req.body;
    
    try {
        const tournament = await Tournament.findByIdAndUpdate(
            { tid: tournamentId },
            updateData,
            { new: true }
        ).populate('teams');

        if (!tournament) {
            return res.status(404).json({ message: "Tournament not found" });
        }

        res.status(200).json({ message: "Tournament updated successfully", tournament });
    } catch (error) {
        res.status(500).json({ error: "Error updating tournament" });
    }
};

// Update winner
// controllers/tournamentController.js
exports.updateWinner = async (req, res) => {
    const { tournamentId, winningTeamId } = req.body;

    try {
        // Find the tournament
        const tournament = await Tournament.findById(tournamentId);
        if (!tournament) {
            return res.status(404).json({ message: "Tournament not found" });
        }

        // Check if the logged-in user is the organiser
        if (!tournament.organiser.equals(req.user.id)) {
            return res.status(403).json({ message: "Only the organiser can update the winner" });
        }

        // Find the winning team and their players
        const winningTeam = await Team.findById(winningTeamId).populate("players");
        if (!winningTeam) {
            return res.status(404).json({ message: "Winning team not found" });
        }

        // Update tournament with winner info
        tournament.winner = winningTeamId;
        tournament.status = "Completed";
        tournament.winningDetails = {
            prizeAmount: tournament.prizePool,
            winningDate: new Date()
        };
        await tournament.save();

        // Update players to reflect tournament victory
        await Promise.all(
            winningTeam.players.map(async (playerId) => {
                const player = await Player.findById(playerId);
                if (!player) return;

                const existing = player.tournaments.find(t => 
                    t.tournament.toString() === tournamentId
                );

                if (existing) {
                    existing.won = true;
                } else {
                    player.tournaments.push({ tournament: tournament._id, won: true });
                }

                await player.save();
            })
        );

        // ❗ Clear global player ranking cache
        await delCache('global_player_ranking');
        console.log("Cache cleared for global player ranking");

        res.status(200).json({ message: "Winner updated successfully", tournament });
    } catch (error) {
        console.error("Error updating winner:", error);
        res.status(500).json({ error: "Error updating winner" });
    }
};



// Update points table
// controllers/tournamentController.js

exports.updatePointsTable = async (req, res) => {
  const organiserId = req.user._id;
  const { tournamentId, teamName, additionalPoints } = req.body;

  try {
    console.log(teamName);

      const tournament = await Tournament.findById(tournamentId).populate('teams');
      if (!tournament) {
          return res.status(404).json({ message: 'Tournament not found' });
      }

      const tname = await Team.findById(teamName);
      if (!tname) {
        return res.status(404).json({ message: 'Team not found' });
      }

      // Check if organiserId is valid
      if (!tournament.organiser || tournament.organiser.toString() !== organiserId.toString()) {
          return res.status(403).json({ message: 'Unauthorized: You are not the organiser of this tournament' });
      }

      // Find the team by teamName instead of teamId
      const team = tournament.teams.find(t => t.name === tname.name);
      if (!team) {
          return res.status(404).json({ message: 'Team not found in tournament' });
      }

      console.log('Team found:', team);  // Debug: log team found

      // Update pointsTable to include teamName
      const teamEntry = tournament.pointsTable.find(entry => entry.teamName === tname.name);
      if (!teamEntry) {
          return res.status(404).json({ message: 'Team not found in points table' });
      }

      // Update the team's points
      teamEntry.totalPoints = Number(teamEntry.totalPoints) + Number(additionalPoints);

      // Sort pointsTable by totalPoints
      tournament.pointsTable.sort((a, b) => b.totalPoints - a.totalPoints);

      // Update rankings
      tournament.pointsTable.forEach((entry, index) => {
          entry.ranking = index + 1;
      });

      // Save updated tournament
      await tournament.save();

      // Return the updated tournament
      res.status(200).json({ message: 'Points table updated successfully', tournament });
  } catch (error) {
      console.error("Error updating points table:", error);
      res.status(500).json({ message: 'Internal server error', error });
  }
};



// Fetch enrolled tournaments
exports.getEnrolledTournaments = async (req, res) => {
  try {
    // Extract player ID from the authenticated user
    const playerId = req.user._id;

    // Find the player by ID and populate the team field
    const player = await Player.findById(playerId).populate('team');
    if (!player) {
      console.log("Player not found");
      return res.status(404).json({ message: 'Player not found' });
    }

    // Check if the player has a team
    if (!player.team) {
      return res.status(200).json({ tournaments: [] });  // Return empty tournaments array
    }

    // Find the tournaments that the team is enrolled in
    const teamId = player.team._id;
    const tournaments = await Tournament.find({ teams: teamId }).populate({
      path: 'organiser',
      select: 'name email',
    });

    // If no tournaments are found, return an empty array
    if (tournaments.length === 0) {
      return res.status(200).json({ tournaments: [] });
    }

    return res.status(200).json({ tournaments }); // Return tournaments to frontend
  } catch (error) {
    console.error('Error fetching enrolled tournaments:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

// Fetch tournament by ID
exports.getTournamentById = async (req, res) => {
    try {
      const tournamentId = req.params.tournamentId;
      console.log('Received tournamentId in API:', tournamentId); // Debugging log
  
      // Fetch the tournament and populate teams and their players
      const tournament = await Tournament.findById(tournamentId).populate({
        path: 'teams',
        populate: {
          path: 'players captain', // Assuming 'players' and 'captain' are fields in Team model referencing Player
          model: 'Player',
        },
      });
  
      if (!tournament) {
        return res.status(404).json({ message: 'Tournament not found' });
      }
  
      // Fetch the organiser details
      const organiser = await Organiser.findById(tournament.organiser);
      if (!organiser) {
        return res.status(404).json({ error: 'Organiser not found' });
      }
  
      // Ensure the user is authenticated
      if (!req.user || !req.user.id) {
        return res.status(401).json({ error: 'Unauthorized' });
      }
  
      const currentUserId = req.user.id.toString(); // Convert to string for comparison
  
      // Initialize flags
      let isPlayerInTournament = false;
      let isCaptain = false;
      //hello
  
      // Iterate through each team to check if the user is a player or captain
      tournament.teams.forEach((team) => {
        const playerIds = team.players.map((player) => player._id.toString());
        if (playerIds.includes(currentUserId)) {
          isPlayerInTournament = true;
          if (team.captain && team.captain._id.toString() === currentUserId) {
            isCaptain = true;
          }
        }
      });
  
      res.status(200).json({
        tournament,
        organiser,
        userRole: req.user.role,
        isPlayerInTournament,
        isCaptain, // Include this if frontend expects it
      });
    } catch (error) {
      console.error('Error fetching tournament:', error);
      res.status(500).json({ message: 'Server error' });
    }
  };
  
  
// Tournament edit page
exports.getTournamentEditPage = async (req, res) => {
    try {
        const tournament = await Tournament.findOne({ tid: req.params.tournamentId });

        if (!tournament) {
            return res.status(404).json({ message: 'Tournament not found' });
        }

        res.status(200).json({ tournament });
    } catch (error) {
        return res.status(500).json({ message: 'Server error' });
    }
};



// controllers/tournamentController.js


exports.editTournament = async (req, res) => {
  const { name, startDate, endDate, entryFee, prizePool, status, description, winner } = req.body;
  const { tournamentId } = req.params;

  try {
      const updatedTournament = await Tournament.findByIdAndUpdate(
          tournamentId,
          {
              name,
              startDate,
              endDate,
              entryFee,
              prizePool,
              status,
              description,
              winner,
          },
          { new: true, runValidators: true }
      );

      if (!updatedTournament) {
          return res.status(404).json({ message: 'Tournament not found' });
      }

      res.status(200).json({ message: 'Tournament updated successfully', tournament: updatedTournament });
  } catch (error) {
      console.error('Error updating tournament:', error);
      return res.status(500).json({ message: 'Server error' });
  }
};

exports.joinTournament = async (req, res) => {
  const { tournamentId } = req.params;
  const { _id } = req.user;

  try {
    // Validate tournamentId format
    if (!mongoose.isValidObjectId(tournamentId)) {
      return res.status(400).json({ message: "Invalid tournament ID" });
    }

    // Find player and ensure they have a team
    const player = await Player.findOne({ _id }).populate("team");
    if (!player) {
      return res.status(404).json({ message: "Player not found" });
    }
    if (!player.team) {
      return res.status(400).json({ message: "Player must be part of a team" });
    }

    // Find the tournament
    const tournament = await Tournament.findOne({ _id: tournamentId }).populate("organiser");
    if (!tournament) {
      return res.status(404).json({ message: "Tournament not found" });
    }
    
    // Ensure the team is not already registered
    if (tournament.teams.some(teamId => teamId.toString() === player.team._id.toString())) {
      return res.status(400).json({ message: "Team is already registered for this tournament" });
    }

    // Ensure team has a valid name
    if (!player.team.name) {
      return res.status(400).json({ message: "Team name is missing" });
    }
    // Add the team to the pointsTable
    tournament.pointsTable.push({
      ranking: tournament.pointsTable.length + 1,
      teamName: player.team.name,
      totalPoints: 0
    });

    tournament.teams.push(player.team._id);

    // Update tournament revenue
    tournament.revenue += tournament.entryFee;
    await tournament.save();

    // Update organiser revenue and clear related caches
    if (tournament.organiser) {
      const organiser = await Organiser.findById(tournament.organiser._id);
      if (organiser) {
        organiser.totalRevenue += tournament.entryFee;
        await organiser.save();

        // Clear all related caches
        await Promise.all([
          delCache(`organiser_name_${tournament.organiser._id}`),
          delCache(`organiser_revenue_${tournament.organiser._id}`),
          delCache(`organiser_dashboard_${organiser.username}`),
          delCache(`tournament_${tournamentId}`)
        ]);
      }
    }

    // Update the team's tournament list
    const team = await Team.findById(player.team._id);
    if (team) {
      team.tournaments.push(tournament._id);
      await team.save();
    }

    // Update player's tournaments
    player.tournaments.push({ tournament: tournament._id, won: false });
    await player.save();

    return res.status(200).json({ message: "Successfully joined the tournament" });
  } catch (error) {
    console.error("Error joining tournament:", error);
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};

exports.getPointsTable = async (req, res) => {
  const { tournamentId } = req.params;
  try {
    const tournament = await Tournament.findOne({ tid: tournamentId }).populate('teams');

      if (!tournament) {
          return res.status(404).json({ message: 'Tournament not found' });
      }

      const tournamentName = tournament.name;
      const pointsTable = tournament.pointsTable || [];

      res.status(200).json({
          tournamentName,
          pointsTable
      });
  } catch (error) {
      console.error('Error fetching tournament details:', error);
      return res.status(500).json({ message: 'Server error' });
  }
};

exports.leaveTournament = async (req, res) => {
  try {
    const tournamentId = req.params.tournamentId;
    const playerId = req.user._id;

    const tournament = await Tournament.findOne({ _id: tournamentId }).populate('teams');

    if (!tournament) {
      return res.status(404).json({ message: 'Tournament not found' });
    }

    const team = tournament.teams.find(team => team.players.includes(playerId));

    if (!team) {
      return res.status(400).json({ message: 'Player is not part of any team in this tournament' });
    }

    if (team.captain.toString() !== playerId.toString()) {
      return res.status(403).json({
        message: 'Only the team captain can leave the tournament. Please contact your team captain.'
      });
    }

    tournament.teams = tournament.teams.filter(t => t._id.toString() !== team._id.toString());

    await tournament.save();

    res.status(200).json({ message: 'You have successfully left the tournament' });

  } catch (error) {
    console.error('Error while leaving tournament:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};

// controllers/tournamentController.js


exports.getTournamentById = async (req, res) => {
  const { tournamentId } = req.params; // Must match the route parameter

  try {
      console.log(`Fetching tournament with ID: ${tournamentId}`);

      // Validate tournamentId format
      if (!mongoose.Types.ObjectId.isValid(tournamentId)) {
          console.warn(`Invalid tournament ID format: ${tournamentId}`);
          return res.status(400).json({ message: 'Invalid tournament ID format.' });
      }

      // Fetch tournament with populated fields
      const tournament = await Tournament.findById(tournamentId)
          .populate('teams')
          .populate('organiser'); // Removed 'winner' as 'winner' is a string

      if (!tournament) {
          console.warn(`Tournament not found: ${tournamentId}`);
          return res.status(404).json({ message: 'Tournament not found.' });
      }

      console.log(`Tournament fetched successfully: ${tournament.name}`);

      // Determine userRole based on authentication
      const userRole = req.user && req.user.role ? req.user.role : 'guest';
      console.log(`User Role: ${userRole}`);

      res.status(200).json({ tournament, organiser: tournament.organiser, userRole });
  } catch (error) {
      console.error(`Error fetching tournament ID ${tournamentId}:`, error);
      res.status(500).json({ message: 'Server error' });
  }
};





