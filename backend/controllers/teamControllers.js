const Team = require('../models/Team');
const Player = require('../models/Player');
const jwt = require('jsonwebtoken');


// Create a new team                 
exports.createTeam = async (req, res) => {
  const { name } = req.body;
  const { _id: playerId } = req.user;  // Extract playerId from JWT token

  try {
    const existingTeam = await Team.findOne({ name });
    if (existingTeam) {
      return res.status(400).json({ message: 'Team name already exists' });
    }

    const player = await Player.findById(playerId);
    if (!player) {
      return res.status(404).json({ message: 'Player not found' });
    }
    if (player.team) {
      return res.status(400).json({ message: 'Player is already part of another team' });
    }

    const team = new Team({
      name,
      captain: playerId,
      players: [playerId]
    });

    await team.save();

    player.team = team._id;
    await player.save();

    res.status(201).json({ message: 'Team created successfully', team });
  } catch (error) {
    console.error('Error creating team:', error);
    res.status(500).json({ error: 'Error creating team', details: error.message });
  }
};

  
// Join an existing team              
exports.joinTeam = async (req, res) => {
  const { teamId } = req.body;
  const { _id: playerId } = req.user;  // Extract playerId from JWT token

  try {
    const team = await Team.findById(teamId);
    if (!team) {
      return res.status(404).json({ message: 'Team not found' });
    }

    await Player.findByIdAndUpdate(playerId, { team: teamId });
    team.players.push(playerId);
    await team.save();

    res.status(200).json({ message: 'Joined team successfully', team });
  } catch (error) {
    res.status(500).json({ error: 'Error joining team' });
  }
};


// Leave a team
exports.leaveTeam = async (req, res) => {
  const { _id: playerId } = req.user;  // Extract playerId from JWT token

  try {
    const player = await Player.findById(playerId);
    if (!player || !player.team) {
      return res.status(404).json({ message: 'Player is not in a team' });
    }

    const team = await Team.findById(player.team);
    team.players.pull(playerId);
    await team.save();

    player.team = null;
    await player.save();

    res.status(200).json({ message: 'Left team successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Error leaving team' });
  }
};

// search a Team by name
exports.getTeamsByName = async (req, res) => {
  const { searchTerm } = req.query;

  if (!searchTerm) {
      return res.status(400).json({ message: 'Search term is required' });
  }

  try {
      const teams = await Team.find({ name: { $regex: new RegExp(searchTerm, 'i') } })
          .populate('players')
          .populate('captain');

      // Always return a teams property in the response
      res.status(200).json({ teams: teams || [] });
  } catch (error) {
      console.error('Error fetching teams:', error);
      res.status(500).json({ error: 'Error fetching teams', details: error.message });
  }
};




// Update team name (only by captain)
exports.updateTeamName = async (req, res) => {
  const { teamId, newName } = req.body;
  const { _id: captainId } = req.user;  // Extract captainId from JWT token

  try {
    // Fetch the team by teamId
    const team = await Team.findById(teamId);
    if (!team) {
      return res.status(404).json({ message: 'Team not found' });
    }

    // Debugging: log captainId and team.captain for comparison
    console.log('Captain ID from token:', captainId.toString());
    console.log('Team Captain ID from DB:', team.captain.toString());

    // Check if the current user is the captain of the team
    if (team.captain.toString() !== captainId.toString()) {
      return res.status(403).json({ message: 'Only the captain can update the team name' });
    }

    // Check if a team with the new name already exists
    const existingTeam = await Team.findOne({ name: newName });
    if (existingTeam) {
      return res.status(400).json({ message: 'Team name already exists' });
    }

    // Update the team name
    team.name = newName;
    await team.save();

    res.status(200).json({ message: 'Team name updated successfully', team });
  } catch (error) {
    console.error('Error updating team name:', error);
    res.status(500).json({ error: 'Error updating team name', details: error.message });
  }
};



exports.getEnrolledTeams = async (req, res) => {
  const { _id: playerId } = req.user; // Extract playerId from JWT token

  try {
    // Find teams where the player is in the players array
    const teams = await Team.find({ players: playerId }); // Correctly reference the 'players' array
    res.json({ teams });
  } catch (error) {
    res.status(500).json({ message: "Error fetching enrolled teams", error: error.message });
  }
};
