const Team = require('../models/Team');
const Player = require('../models/Player');
const jwt = require('jsonwebtoken');

// Create a new team
exports.createTeam = async (req, res) => {
  const { name } = req.body;
  const { _id: playerId } = req.user; 
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

// Leave a team
exports.leaveTeam = async (req, res) => {
  const { _id: playerId } = req.user;

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

    res.status(200).json({ message: 'Successfully left the team' });
  } catch (error) {
    res.status(500).json({ error: 'Error leaving team' });
  }
};

// Controller to fetch teams based on search term
exports.getTeamsByName = async (req, res) => {
  const { searchTerm } = req.query;

  if (!searchTerm) {
    return res.status(400).json({ teams: [], searchTerm: null, error: 'Search term is required' });
  }

  try {
    const teams = await Team.find({ name: { $regex: new RegExp(searchTerm, 'i') } })
      .populate('players', 'name') 
      .populate('captain', 'name'); 

    
    console.log('Fetched Teams:', JSON.stringify(teams, null, 2));

    res.status(200).json({ teams, searchTerm, error: null });
  } catch (error) {
    console.error('Error fetching teams:', error);
    res.status(500).json({ teams: [], searchTerm, error: 'Error fetching teams' });
  }
};

// Update team name (only by captain)
exports.updateTeamName = async (req, res) => {
  const { newName } = req.body;
  const { _id: playerId } = req.user;  // Extract playerId from JWT token

  try {
    // Fetch the player to get the team ID
    const player = await Player.findById(playerId).populate('team');
    if (!player) {
      return res.status(404).json({ message: 'Player not found' });
    }

    const team = player.team; 
    if (!team) {
      return res.status(404).json({ message: 'Player is not in a team' });
    }

    // Check if the current user is the captain of the team
    if (team.captain.toString() !== playerId.toString()) {
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

// Get enrolled teams for a player
exports.getEnrolledTeams = async (req, res) => {
  const { _id: playerId } = req.user; // Extract playerId from JWT token

  try {
    // Find teams where the player is in the players array
    const teams = await Team.find({ players: playerId }); // Correctly reference the 'players' array
    res.status(200).json({ teams });
  } catch (error) {
    res.status(500).json({ message: "Error fetching enrolled teams", error: error.message });
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

    // Check if the player is already in the team (optional)
    if (team.players.includes(playerId)) {
      return res.status(400).json({ message: 'You are already a member of this team.' });
    }

    // Update the player to join the team
    await Player.findByIdAndUpdate(playerId, { team: teamId });
    team.players.push(playerId);
    await team.save();

    return res.status(200).json({ message: 'Successfully joined the team', team });
  } catch (error) {
    console.error('Error joining team:', error);
    return res.status(500).json({ error: 'Error joining team' });
  }
};

// (NOT DIRECLTY)
exports.requestToJoinTeam = async (req, res) => {
  const { teamId } = req.body;
  const { _id: playerId } = req.user;  // Extract playerId from JWT token

  try {
    const team = await Team.findById(teamId);
    if (!team) {
      return res.status(404).json({ message: 'Team not found' });
    }

    // Check if the player is already in the team
    if (team.players.includes(playerId)) {
      return res.status(400).json({ message: 'You are already a member of this team.' });
    }

    // Check if the player has already requested to join
    if (team.joinRequests.includes(playerId)) {
      return res.status(400).json({ message: 'You have already requested to join this team.' });
    }

    // Add the player to the joinRequests array
    team.joinRequests.push(playerId);
    await team.save();

    return res.status(200).json({ message: 'Request to join the team sent successfully' });
  } catch (error) {
    console.error('Error sending join request:', error);
    return res.status(500).json({ error: 'Error sending join request' });
  }
};

// Get join requests for a team (only captains can access this)
exports.getJoinRequests = async (req, res) => {
  const { teamId } = req.params;
  const { _id: captainId } = req.user;  // Extract captainId from JWT token

  try {
    const team = await Team.findById(teamId).populate('joinRequests', 'name');
    if (!team) {
      return res.status(404).json({ message: 'Team not found' });
    }

    // Check if the current user is the captain
    if (team.captain.toString() !== captainId.toString()) {
      return res.status(403).json({ message: 'Only the team captain can view join requests' });
    }

    res.status(200).json({ joinRequests: team.joinRequests });
  } catch (error) {
    console.error('Error fetching join requests:', error);
    return res.status(500).json({ error: 'Error fetching join requests' });
  }
};

// Accept a join request (only captains can accept)
exports.acceptJoinRequest = async (req, res) => {
  const { teamId, playerId } = req.body;
  const { _id: captainId } = req.user;  // Extract captainId from JWT token

  try {
    const team = await Team.findById(teamId);
    if (!team) {
      return res.status(404).json({ message: 'Team not found' });
    }

    // Check if the current user is the captain
    if (team.captain.toString() !== captainId.toString()) {
      return res.status(403).json({ message: 'Only the team captain can accept join requests' });
    }

    // Check if the player has requested to join the team
    if (!team.joinRequests.includes(playerId)) {
      return res.status(400).json({ message: 'This player has not requested to join the team' });
    }

    // Remove the player from the joinRequests array
    team.joinRequests.pull(playerId);
    // Add the player to the players array
    team.players.push(playerId);
    await team.save();

    // Add the player to the team document in the Player model as well
    await Player.findByIdAndUpdate(playerId, { team: teamId });

    res.status(200).json({ message: 'Player added to the team successfully' });
  } catch (error) {
    console.error('Error accepting join request:', error);
    return res.status(500).json({ error: 'Error accepting join request' });
  }
};

// Reject a join request (only captains can reject)
exports.rejectJoinRequest = async (req, res) => {
  const { teamId, playerId } = req.body;
  const { _id: captainId } = req.user;  // Extract captainId from JWT token

  try {
    const team = await Team.findById(teamId);
    if (!team) {
      return res.status(404).json({ message: 'Team not found' });
    }

    // Check if the current user is the captain
    if (team.captain.toString() !== captainId.toString()) {
      return res.status(403).json({ message: 'Only the team captain can reject join requests' });
    }

    // Check if the player has requested to join the team
    if (!team.joinRequests.includes(playerId)) {
      return res.status(400).json({ message: 'This player has not requested to join the team' });
    }

    // Remove the player from the joinRequests array
    team.joinRequests.pull(playerId);
    await team.save();

    res.status(200).json({ message: 'Player join request rejected' });
  } catch (error) {
    console.error('Error rejecting join request:', error);
    return res.status(500).json({ error: 'Error rejecting join request' });
  }
};