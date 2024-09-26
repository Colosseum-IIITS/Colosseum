const Tournament = require("../models/Tournament");
const Player = require("../models/Player");
const Team = require("../models/Team");
const jwt = require('jsonwebtoken');
const Organiser = require("../models/Organiser");

// Create a new tournament
exports.createTournamentForm=async(req,res)=>{
    res.render('createTournament',{organiser:req.user});
}
//working

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

  console.log("Request Body:", req.body);
  console.log("User from JWT:", req.user._id);

  try {
    // Check if tournament ID is unique
    const existingTournament = await Tournament.findOne({ tid });
    if (existingTournament) {
      return res.status(400).json({ message: "Tournament ID already exists" });
    }

    // Create a new tournament
    const tournament = new Tournament({
      tid,
      name,
      startDate,
      endDate,
      entryFee,
      prizePool,
      status: "Pending", // Initially setting the tournament status to 'Pending'
      description,
      organiser,
    });
    
    // Save the tournament to the database
    const savedTournament = await tournament.save();

    // Update the organiser to add the new tournament's ID
    const organiserUpdate = await Organiser.findByIdAndUpdate(
      organiser,
      { $push: { tournaments: savedTournament._id } }, // Push new tournament ID to the organiser's tournaments array
      { new: true } // Return the updated organiser document
    );

    // If organiser update fails
    if (!organiserUpdate) {
      return res.status(404).json({ message: "Organiser not found" });
    }

    // Respond with success
    res.status(201).json({
      message: "Tournament created successfully and appended to organiser's list",
      tournament: savedTournament,
      organiser: organiserUpdate,
    });
  } catch (error) {
    res.status(500).json({ error: "Error creating tournament" });
    console.error("Error creating tournament:", error);
  }
};


//added new EditTournamentFucntion, similar to this
// Update an existing tournament
exports.updateTournament = async (req, res) => {
  const { tournamentId } = req.params; // Tournament ID from the URL params
  const updateData = req.body; // Data from the request body to update the tournament

  try {
    // Find the tournament by its ID and update it
    const tournament = await Tournament.findByIdAndUpdate(
      tournamentId,
      updateData,
      { new: true }
    );

    if (!tournament) {
      return res.status(404).json({ message: "Tournament not found" });
    }

    res
      .status(200)
      .json({ message: "Tournament updated successfully", tournament });
  } catch (error) {
    res.status(500).json({ error: "Error updating tournament" });
  }
};

// Update Winner
exports.updateWinner = async (req, res) => {
  const { tournamentId, winnerId } = req.body;

  try {
    // Find the tournament by ID
    const tournament = await Tournament.findById(tournamentId);
    if (!tournament) {
      return res.status(404).json({ message: "Tournament not found" });
    }

    // Check if the requester is the organizer
    if (!tournament.organizer.equals(req.user.id)) {
      return res
        .status(403)
        .json({ message: "Only the organizer can update the winner" });
    }

    // Update the winner in the tournament
    tournament.winner = winnerId;
    await tournament.save();

    // Update the player's tournament won status
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

    res
      .status(200)
      .json({ message: "Winner updated successfully", tournament });
  } catch (error) {
    console.error("Error updating winner:", error);
    res.status(500).json({ error: "Error updating winner" });
  }
};

// Button per team
exports.updatePointsTable = async (req, res) => {
  const { tournamentId, teamName, additionalPoints } = req.body;
  const organiserId = req.user._id; // Extracted from JWT token

  console.log("rithvik hot",req.body);
  console.log("rithvik hot" , req.user._id);
  try {
      const tournament = await Tournament.findById(tournamentId);
      if (!tournament) {
          return res.status(404).json({ message: 'Tournament not found' });
      }


      // Check if the requester is the organizer of the tournament
      if (tournament.organiser.toString() !== organiserId.toString()) {
          return res.status(403).json({ message: 'Unauthorized: You are not the organizer of this tournament' });
      }

      const teamEntry = tournament.pointsTable.find(entry => entry.teamName === teamName);
      if (!teamEntry) {
          return res.status(404).json({ message: 'Team not found in points table' });
      }

      teamEntry.totalPoints += additionalPoints;

      await tournament.save();
      return res.status(200).json({ message: 'Points updated successfully', tournament });
  } catch (error) {
      return res.status(500).json({ message: 'Internal server error', error });
  }
};

// In your controller function
exports.getEnrolledTournaments = async (req, res) => {
  const { id: playerId } = req.user; // Extract playerId from JWT token
  console.log("Fetching tournaments for player:", playerId); // Log player ID

  try {
    const player = await Player.findById(playerId).populate("team"); // Ensure you have the player's team populated
    if (!player || !player.team) {
      return res.status(404).json({ message: "Player or team not found" });
    }

    // Find tournaments that the player's team is enrolled in
    const tournaments = await Tournament.find({
      teams: player.team._id,
    }).populate("teams", "name"); // Populate the teams with only the name

    console.log("Tournaments Found:", tournaments); // Log the tournaments found

    if (tournaments.length > 0) {
      // If tournaments are found, send them back along with a message
      res.json({
        tournaments: tournaments.map((tournament) => ({
          tournamentId: tournament._id,
          tournamentName: tournament.name,
          teams: tournament.teams, // This will now include the populated team details
        })),
        message: "You are already enrolled in the following tournaments.",
      });
    } else {
      // If no tournaments are found
      res.json({
        tournaments: [],
        message: "You are not enrolled in any tournaments.",
      });
    }
  } catch (error) {
    res
      .status(500)
      .json({
        message: "Error fetching enrolled tournaments",
        error: error.message,
      });
  }
};

exports.getTournamentById = async (req, res) => {
  try {
    const tournament = await Tournament.findOne({ tid: req.params.tournamentId })
      .populate('organiser')
      .populate('teams');

    if (!tournament) {
      return res.status(404).send('Tournament not found');
    }
    console.log(req.user.role);
    // Pass the tournament and user role to the view
    res.render('tournamentDetails', { tournament, userRole: req.user.role , username :req.user.username });

  } catch (error) {
    console.error('Error fetching tournament:', error);
    return res.status(500).send('Server error');
  }
};

exports.getTournamentEditPage = async (req, res) => {
  try {
    // Fetch the tournament by its 'tid' parameter
    const tournament = await Tournament.findOne({ tid: req.params.tournamentId });

    if (!tournament) {
      return res.status(404).send('Tournament not found');
    }

    // Render the 'tournamentEdit' EJS view and pass the tournament data
    res.render('tournamentEditPage', { tournament });
  } catch (error) {
    console.error('Error fetching tournament for editing:', error);
    return res.status(500).send('Server error');
  }
};

exports.editTournament = async (req, res) => {
  const { name, startDate, endDate, entryFee, prizePool, status, description, winner } = req.body;
  const { tournamentId } = req.params;

  try {
      // Find the tournament by ID and update it
      const updatedTournament = await Tournament.findOneAndUpdate(
          { tid: tournamentId }, // Match by TID
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
          return res.status(404).send('Tournament not found');
      }

      // Redirect to the updated tournament's details page
      res.redirect(`/api/tournament/${updatedTournament.tid}`);
  } catch (error) {
      console.error('Error updating tournament:', error);
      return res.status(500).send('Server error');
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
        //     return res.status(400).json({ message: 'your team is banned' });
        // }

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


