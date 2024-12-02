const Tournament = require("../models/Tournament");
const Player = require("../models/Player");
const Team = require("../models/Team");
const jwt = require('jsonwebtoken');
const Organiser = require("../models/Organiser");

//Create a new tournament
exports.createTournamentForm = async (req, res) => {
    res.status(200).json({ message: "Render createTournament page", organiser: req.user });
};

// Create a tournament.
exports.createTournament = async (req, res) => {
    const {
        tid,
        name,
        startDate,
        endDate,
        entryFee,
        prizePool,
        description,
    } = req.body;

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

        return res.status(200).json({ message: "Tournament created successfully", tournament: savedTournament });
    } catch (error) {
        res.status(500).json({ error: "Error creating tournament" });
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
    const { id: playerId } = req.user;

    try {
        const player = await Player.findById(playerId)
            .populate({
                path: 'tournaments.tournament',
                model: 'Tournament'
            })
            .populate('team');

        if (!player || !player.team) {
            return res.status(404).json({ message: "Player or team not found" });
        }

        // Extract unique tournaments based on _id
        const tournaments = player.tournaments.map((t) => t.tournament);

        const uniqueTournaments = [...new Map(tournaments.map(t => [t._id, t])).values()];  // Remove duplicates

        if (uniqueTournaments.length > 0) {
            res.status(200).json({
                tournaments: uniqueTournaments,
                message: "You are already enrolled in the following tournaments."
            });
        } else {
            res.status(200).json({
                tournaments: [],
                message: "You are not enrolled in any tournaments."
            });
        }
    } catch (error) {
        res.status(500).json({
            message: "Error fetching enrolled tournaments",
            error: error.message
        });
    }
};


// Fetch tournament by ID
exports.getTournamentById = async (req, res) => {
    try {
      const tournId = req.params.tournamentId;
      console.log(`Fetching tournament with ID: ${tournId}`); // Log the tournament ID being requested
  
      // Find tournament by the custom 'tid' field instead of '_id'
      const tournament = await Tournament.findOne({ tid: tournId }).populate('teams');
      if (!tournament) {
        console.log(`Tournament with ID ${tournId} not found`);
        return res.status(404).json({ message: 'Tournament not found' });
      }
  
      let isPlayerInTournament = false;
  
      // Check if the user is a player and belongs to a team in the tournament
      if (req.user.role === 'player') {
        const player = await Player.findById(req.user._id).populate({
          path: 'team',
          match: { _id: { $in: tournament.teams } }
        });
  
        if (player && player.team) {
          isPlayerInTournament = true;
        } else {
          console.log(`Player ${req.user.username} is not part of the tournament ${tournId}`);
        }
      }
  
      // Fetch the organiser details for the tournament
      const organiser = await Organiser.findById(tournament.organiser);
      if (!organiser) {
        console.log(`Organiser for tournament ${tournId} not found`);
        return res.status(404).json({ error: 'Organiser not found.' });
      }
  
      // Return the tournament details along with organiser info, user role, and player participation status
      res.status(200).json({
        tournament,
        organiser,
        userRole: req.user.role,
        username: req.user.username,
        isPlayerInTournament
      });
    } catch (error) {
      console.error(`Error fetching tournament ${req.params.tournamentId}:`, error); // Log detailed error
      return res.status(500).json({ message: 'Server error', error: error.message });
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
    const { tournamentId } = req.params;
    const { _id } = req.user;

    try {
        const player = await Player.findOne({ _id }).populate('team');
        if (!player) {
            return res.status(404).json({ message: 'Player not found' });
        }

        if (!player.team) {
            return res.status(400).json({ message: 'Player must be part of a team' });
        }

        const tournament = await Tournament.findOne({ tid: tournamentId });
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