const Team = require('../models/Team');
const Player = require('../models/Player');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');

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
      captain: player._id,
      players: [player._id]
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


    if (teams.length > 0) {
      return res.status(200).json({ teams, searchTerm, error: null });
    } else {
      return res.status(404).json({ teams: [], searchTerm, error: 'No teams found' });
    }

  } catch (error) {
    console.error('Error fetching teams:', error);
    return res.status(500).json({ teams: [], searchTerm, error: 'Error fetching teams' });
  }
};


// Update team name (only by captain)
exports.updateTeamName = async (req, res) => {
  const { newName } = req.body;
  const { _id: playerId } = req.user;

  try {
    const player = await Player.findById(playerId).populate('team');
    if (!player) {
      return res.status(404).json({ message: 'Player not found' });
    }

    const team = player.team;
    if (!team) {
      return res.status(404).json({ message: 'Player is not in a team' });
    }

    if (team.captain.toString() !== playerId.toString()) {
      return res.status(403).json({ message: 'Only the captain can update the team name' });
    }

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

// Get enrolled teams for a player
exports.getEnrolledTeams = async (req, res) => {
  const { _id: playerId } = req.user;

  try {
    const teams = await Team.find({ players: playerId });
    res.status(200).json({ teams });
  } catch (error) {
    res.status(500).json({ message: "Error fetching enrolled teams", error: error.message });
  }
};

// Join an existing team 
exports.joinTeam = async (req, res) => {
  const { teamId } = req.body;
  const { _id: playerId } = req.user; 

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
  const { _id: playerId } = req.user;

  try {
    const team = await Team.findById(teamId);
    if (!team) {
      return res.status(404).json({ message: 'Team not found' });
    }

    if (team.players.includes(playerId)) {
      return res.status(400).json({ message: 'You are already a member of this team.' });
    }

    if (team.joinRequests.includes(playerId)) {
      return res.status(400).json({ message: 'You have already requested to join this team.' });
    }

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
  const { _id: playerId } = req.user;  // Extract player ID from authenticated user
  
  try {
    // Step 1: Find the team where the player is the captain
    const team = await Team.findOne({ captain: playerId }).populate('joinRequests');  // Populate joinRequests
    
    if (!team) {
      // Step 2: If the player is not the captain of any team
      return res.status(404).json({ message: 'Player is not the captain of any team' });
    }
    
    // Step 3: If the player is the captain, return the joinRequests
    res.status(200).json({ joinRequests: team.joinRequests });

  } catch (error) {
    console.error('Error fetching join requests:', error);
    return res.status(500).json({ error: 'Error fetching join requests', details: error.message });
  }
};



// Accept a join request (only captains can accept)
exports.acceptJoinRequest = async (req, res) => {
  const { playerId } = req.body;
  const { _id: captainId } = req.user;

  try {
    console.log('Attempting to accept join request...');
    
    // Step 1: Find the team where the captain is the leader
    const team = await Team.findOne({ captain: captainId });
    if (!team) {
      console.error('No team found for this captain');
      return res.status(404).json({ message: 'Team not found for this captain' });
    }
    console.log(`Team found: ${team.name}`);

    // Step 2: Convert playerId to ObjectId
    const playerObjectId = new mongoose.Types.ObjectId(playerId);
    console.log(`Checking if player ${playerId} is in joinRequests...`);

    // Step 3: Check if the player has requested to join
    if (!team.joinRequests.includes(playerObjectId)) {
      console.error('Player has not requested to join the team');
      return res.status(400).json({ message: 'This player has not requested to join the team' });
    }

    // Step 4: Remove player from joinRequests and add to players
    team.joinRequests.pull(playerObjectId);
    team.players.push(playerObjectId);
    await team.save();
    console.log('Player successfully added to the team');

    // Step 5: Update the player's team
    await Player.findByIdAndUpdate(playerObjectId, { team: team._id });
    console.log('Player team updated successfully');

    // Step 6: Send success response
    res.status(200).json({ message: 'Player added to the team successfully' });

  } catch (error) {
    console.error('Error accepting join request:', error);
    return res.status(500).json({ error: 'Error accepting join request', details: error.message });
  }
};


// Reject a join request (only captains can reject)
exports.rejectJoinRequest = async (req, res) => {
  const { playerId } = req.body;
  const { _id: captainId } = req.user;

  try {
    const team = await Team.findOne({ captain: captainId });
    if (!team) {
      return res.status(404).json({ message: 'Team not found for this captain' });
    }

    const playerObjectId = new mongoose.Types.ObjectId(playerId);

    if (!team.joinRequests.includes(playerObjectId)) {
      return res.status(400).json({ message: 'This player has not requested to join the team' });
    }

    team.joinRequests.pull(playerObjectId);
    await team.save();

    res.status(200).json({ message: 'Player join request rejected' });

  } catch (error) {
    console.error('Error rejecting join request:', error);
    return res.status(500).json({ error: 'Error rejecting join request', details: error.message });
  }
};


exports.getTeamDashboard = async (req, res) => {
  const playerId= req.user._id;  // Get the playerId from the authenticated user

  try {
    console.log("Received API call from", playerId);

    const player = await Player.findById(playerId);
    if (!player || !player.team) {
      return res.status(404).json({ message: 'Player or team not found' });
    }

    const teamId = player.team;
    const team = await Team.findById(teamId);
    const role = team.captain.toString() === playerId.toString() ? 'captain' : 'player'; // Check if the player is captain

    await team.populate('players');
    await team.populate('tournaments');

    const captain = await Player.findById(team.captain._id);
    const captainName = captain.username; 

    res.status(200).json({ team, role, captainName });
  } catch (error) {
    console.error('Error fetching team dashboard data:', error);
    res.status(500).json({ message: 'Server error' });
  }
};



exports.removePlayerFromTeam = async (req, res) => {
  console.log("Handling request to remove player with ID:", req.params.playerId);

  const { playerId } = req.params;
  const captainId = req.user._id; 

  try {
    const captain = await Player.findById(captainId).populate('team');
    if (!captain || !captain.team) {
      return res.status(404).json({ message: 'Captain or team not found' });
    }

    const team = captain.team;
    if (team.captain.toString() !== captainId.toString()) {
      return res.status(403).json({ message: 'Only the captain can remove players' });
    }

    team.players = team.players.filter((id) => id.toString() !== playerId.toString());

    await team.save();

    const player = await Player.findById(playerId);
    if (player) {
      player.team = null;
      await player.save();
    }

    res.status(200).json({ message: 'Player removed from team successfully', team });
  } catch (error) {
    console.error('Error removing player:', error);
    res.status(500).json({ message: 'Server error' });
  }
};


exports.getTournamentsWon = async (req, res) => {
  const { teamId } = req.params;

  try {
    // Find the team by ID
    const team = await Team.findById(teamId);
    if (!team) {
      return res.status(404).json({ message: "Team not found" });
    }

    // Query the Tournament model for tournaments won by this team
    const tournamentsWon = await Tournament.find({ winner: team.name });

    res.status(200).json({
      message: "Tournaments won by the team retrieved successfully",
      data: tournamentsWon,
    });

  } catch (error) {
    console.error("Error retrieving tournaments won by the team:", error);
    return res.status(500).json({
      error: "Error retrieving tournaments won by the team",
      details: error.message,
    });
  }
};

exports.getTournamentsPlayed = async (req, res) => {
  const { teamId } = req.params;

  try {
    // Find the team by ID
    const team = await Team.findById(teamId).populate("tournaments", "-__v");
    if (!team) {
      return res.status(404).json({ message: "Team not found" });
    }

    // Get the tournaments the team has participated in
    const tournamentsPlayed = team.tournaments;

    res.status(200).json({
      message: "Tournaments played by the team retrieved successfully",
      data: tournamentsPlayed,
    });
  } catch (error) {
    console.error("Error retrieving tournaments played by the team:", error);
    return res.status(500).json({
      error: "Error retrieving tournaments played by the team",
      details: error.message,
    });
  }
};


