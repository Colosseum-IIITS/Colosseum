const Tournament = require("../models/Tournament");
const Player = require("../models/Player");
const Team = require("../models/Team");
const jwt = require('jsonwebtoken');
const Organiser = require("../models/Organiser");
const mongoose = require('mongoose');

//Create a new tournament
exports.createTournamentForm = async (req, res) => {
    res.status(200).json({ message: "Render createTournament page", organiser: req.user });
};

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
              $push: { notifications: { message } }
          });
      });

      return res.status(200).json({ message: "Tournament created successfully", tournament: savedTournament });
  } catch (error) {
      res.status(500).json({ error: "Error creating tournament" });
  }
};


exports.getNotifications = async (req, res) => {
  const playerId = req.user._id;
  
  console.log(`jjhdsdjsuhfsiufhdsuygdsinbgdgnbdsuhgdsindsugidnuhbg`, playerId);
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
exports.updateWinner = async (req, res) => {
    const { tournamentId, winnerId } = req.body;

    try {
        const tournament = await Tournament.findById(tournamentId);
        if (!tournament) {
            return res.status(404).json({ message: "Tournament not found" });
        }

        if (!tournament.organiser.equals(req.user.id)) {
            return res.status(403).json({ message: "Only the organiser can update the winner" });
        }

        tournament.winner = winnerId;
        await tournament.save();

        const player = await Player.findById(winnerId);
        if (!player) {
            return res.status(404).json({ message: "Player not found" });
        }

        const tournamentIndex = player.tournaments.findIndex((t) =>
            t.tournament.equals(tournamentId)
        );
        if (tournamentIndex !== -1) {
            player.tournaments[tournamentIndex].won = true;
            await player.save();
        }

        res.status(200).json({ message: "Winner updated successfully", tournament });
    } catch (error) {
        res.status(500).json({ error: "Error updating winner" });
    }
};

// Update points table
exports.updatePointsTable = async (req, res) => {
    const organiserId = req.user._id;
    const { tournamentId, teamName, additionalPoints } = req.body;
   
    try {
        const tournament = await Tournament.findOne({ tid: tournamentId }).populate('teams');
        if (!tournament) {
            return res.status(404).json({ message: 'Tournament not found' });
        }

        if (tournament.organiser.toString() !== organiserId.toString()) {
            return res.status(403).json({ message: 'Unauthorized: You are not the organiser of this tournament' });
        }

        const teamEntry = tournament.pointsTable.find(entry => entry.teamName === teamName);
        if (!teamEntry) {
            return res.status(404).json({ message: 'Team not found in points table' });
        }

        teamEntry.totalPoints = Number(teamEntry.totalPoints) + Number(additionalPoints);
        tournament.pointsTable.sort((a, b) => b.totalPoints - a.totalPoints);

        tournament.pointsTable.forEach((entry, index) => {
            entry.ranking = index + 1;
        });

        await tournament.save();

        return res.status(200).json({ message: 'Points table updated successfully' });
    } catch (error) {
        return res.status(500).json({ message: 'Internal server error', error });
    }
};


// Fetch enrolled tournaments
exports.getEnrolledTournaments = async (req, res) => {
    try {
      // Extract player ID from the authenticated user
      const playerId = req.user._id;
  
      // Find the player by ID and populate the tournaments field
      const player = await Player.findById(playerId).populate({
        path: 'tournaments.tournament', // Populate tournament field
        select: 'name startDate endDate status organiser prizePool entryFee', // Specify fields to select
        populate: {
          path: 'organiser', // Populate organiser details
          select: 'name email',  // Select only the necessary fields from organiser
        },
      });
  
      if (!player) {
        console.log("Player not found");
        return res.status(404).json({ message: 'Player not found' });
      }
  
      // Extract the tournaments the player is enrolled in
      const tournaments = player.tournaments.map((t) => t.tournament);
  
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



exports.editTournament = async (req, res) => {
  const { name, startDate, endDate, entryFee, prizePool, status, description, winner } = req.body;
  const { tournamentId } = req.params;

  try {
      const updatedTournament = await Tournament.findOneAndUpdate(
          { tid: tournamentId },
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
          { new: true, runValidators: true } // Return the updated document and apply validators
      );

      // Check if the tournament was found and updated
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
    const { tournamentId } = req.params;  // Get tournamentId from request parameters
    const { _id } = req.user;  // Get the player ID from the authenticated user
  
    try {
      const player = await Player.findOne({ _id }).populate('team');
      if (!player) {
        return res.status(404).json({ message: 'Player not found' });
      }
  
      if (!player.team) {
        return res.status(400).json({ message: 'Player must be part of a team' });
      }
  
      // Use `tournamentId` directly if it's a string
      const tournament = await Tournament.findOne({
        tid: tournamentId,  // Now directly using `tid` field as a string match
      });
      
      if (!tournament) {
        return res.status(404).json({ message: 'Tournament not found' });
      }
  
      // Check if the team is already registered for this tournament
      if (tournament.teams.includes(player.team._id)) {
        return res.status(400).json({ message: 'Team is already registered for this tournament' });
      }
  
      // Register the team for the tournament
      tournament.teams.push(player.team._id);
      await tournament.save();
  
      // Add tournament to player's list of tournaments
      player.tournaments.push({ tournament: tournament._id, won: false });
      await player.save();
  
      return res.status(200).json({ message: 'Successfully joined the tournament' });
    } catch (error) {
      console.error("Error joining tournament:", error);
      return res.status(500).json({ message: 'Server error', error });
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

    const tournament = await Tournament.findOne({ tid: tournamentId }).populate('teams');

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