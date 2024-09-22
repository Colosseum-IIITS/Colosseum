const Team = require('../models/Team');
const Player = require('../models/Player');

// Create a new team                 
//working
exports.createTeam = async (req, res) => {
  const { name, playerId } = req.body;
  try {
    // Check if team name is unique
    const existingTeam = await Team.findOne({ name });
    if (existingTeam) {
      return res.status(400).json({ message: 'Team name already exists' });
    }

    // Check if the player exists and is not already in a team
    const player = await Player.findById(playerId);
    if (!player) {
      return res.status(404).json({ message: 'Player not found' });
    }
    if (player.team) {
      return res.status(400).json({ message: 'Player is already part of another team' });
    }

    // Create new team and automatically assign the player as the captain
    const team = new Team({
      name,
      captain: playerId,
      players: [playerId]
    });

    await team.save();

    // Update the player's team reference
    player.team = team._id;
    await player.save();

    res.status(201).json({ message: 'Team created successfully', team });
  } catch (error) {
    console.error('Error creating team:', error);
    res.status(500).json({ error: 'Error creating team', details: error.message });
  }
};

  
// Join an existing team              
//working
exports.joinTeam = async (req, res) => {
  const { teamId, playerId } = req.body;

  try {
    // Find the team and add the player to it
    const team = await Team.findById(teamId);
    if (!team) {
      return res.status(404).json({ message: 'Team not found' });
    }

    // Update player's team reference
    await Player.findByIdAndUpdate(playerId, { team: teamId });

    // Add player to the team's players list
    team.players.push(playerId);
    await team.save();

    res.status(200).json({ message: 'Joined team successfully', team });
  } catch (error) {
    res.status(500).json({ error: 'Error joining team' });
  }
};

// Leave a team
exports.leaveTeam = async (req, res) => {
  const { playerId } = req.body;

  try {
    // Find the player and remove the team reference
    const player = await Player.findById(playerId);
    if (!player || !player.team) {
      return res.status(404).json({ message: 'Player is not in a team' });
    }

    // Find the team and remove the player
    const team = await Team.findById(player.team);
    team.players.pull(playerId);
    await team.save();

    // Remove the team reference from the player
    player.team = null;
    await player.save();

    res.status(200).json({ message: 'Left team successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Error leaving team' });
  }
};


// search a Team by name
exports.getTeamByName = async (req, res) => {
  const { searchTerm } = req.query;  // Search term will be passed as a query parameter

  try {
      // Perform a case-insensitive search on the team name
      const team = await Team.findOne({ name: { $regex: new RegExp(searchTerm, 'i') } })
          .populate('players')  // Populate player details
          .populate('captain');  // Populate captain details

      // Check if the team exists
      if (!team) {
          return res.status(404).json({ message: 'Team not found' });
      }

      res.status(200).json({ team });
  } catch (error) {
      console.error('Error fetching team:', error);
      res.status(500).json({ error: 'Error fetching team', details: error.message });
  }
};

// Update team name (only by captain)
// working
exports.updateTeamName = async (req, res) => {
  const { teamId, captainId, newName } = req.body;

  try {

    // Check if the team is actually existing
    const team = await Team.findById(teamId);
    if (!team) {
      return res.status(404).json({ message: 'Team not found' });
    }

    // Check if the Captain is a Player
    const player = await Player.findById(captainId);
    if(!player) {
      return res.status(404).json({messge: 'Captain is not a valid player'});
    }

    // Check if the player is the captain of the team
    if (team.captain.toString() !== captainId) {
      return res.status(403).json({ message: 'Only the captain can update the team name' });
    }

    // Check if the new team name is already taken
    const existingTeam = await Team.findOne({ name: newName });
    if (existingTeam) {
      return res.status(400).json({ message: 'Team name already exists' });
    }

    team.name = newName;
    await team.save();

    res.status(200).json({ message: 'Team name updated successfully', team });
  } catch (error) {
    console.error('Error updating team name:', error);
    res.status(500).json({ error: 'Error updating team name', details: error.message });
  }
};

