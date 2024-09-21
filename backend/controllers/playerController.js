// player db access and CRUD

const Tournament = require('../models/Tournament');
const Player = require('../models/Player');
const Organiser = require('../models/Organiser');
const team = require('../models/Team');
const bcrypt = require('bcrypt');


// Func: Register a new player                         
//working
exports.createPlayer = async (req, res) => {
  const { username, email, password } = req.body;

  try {
    // Check if email or username already exists
    const existingPlayer = await Player.findOne({ $or: [{ email }, { username }] });
    if (existingPlayer) {
      return res.status(400).json({ message: 'Email or Username already exists' });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create a new player
    const player = new Player({
      username,
      email,
      password: hashedPassword  // Store the hashed password
    });

    await player.save();
    res.status(201).json({ message: 'Player created successfully', player });
  } catch (error) {
    console.error('Error during player creation:', error);  // Log the error for debugging
    res.status(500).json({ error: 'Error creating player', details: error.message });
  }
};

// Func: Search tournaments by tid or name             
//working
exports.searchTournaments = async (req, res) => {
  try {
    const { searchTerm } = req.query;
  
    // Search for tournaments where 'tid' or 'name' matches the search term (case-insensitive)
    const tournaments = await Tournament.find({
      $or: [
        { tid: new RegExp(searchTerm, 'i') },  // Case-insensitive regex search for 'tid'
        { name: new RegExp(searchTerm, 'i') }  // Case-insensitive regex search for 'name'
      ]
    });
  
    if (tournaments.length === 0) {
      return res.status(404).json({ message: 'No tournaments found' });
    }
    res.status(200).json(tournaments);
  } catch (error) {
    res.status(500).json({ error: 'Error searching tournaments' });
  }
};

// Func: follow Organisation
exports.followOrganiser = async (req, res) => {
  const { playerId, organiserId } = req.body;

  try {
    // Find the player by ID
    const player = await Player.findById(playerId);
    if (!player) {
      return res.status(404).json({ message: 'Player not found' });
    }

    // Find the organiser by ID
    const organiser = await Organiser.findById(organiserId);
    if (!organiser) {
      return res.status(404).json({ message: 'Organiser not found' });
    }

    // Check if player is already following the organiser
    if (player.following.includes(organiserId)) {
      return res.status(400).json({ message: 'Player is already following this organiser' });
    }

    // Add the organiser to the player's following list
    player.following.push(organiserId);
    await player.save();

    // Add the player to the organiser's followers list
    organiser.followers.push(playerId);
    await organiser.save();

    res.status(200).json({ message: 'Organiser followed successfully', player, organiser });
  } catch (error) {
    res.status(500).json({ error: 'Error following organiser' });
  }
};

// Func: unfollows organisation 
exports.unfollowOrganiser = async (req, res) => {
  const { playerId, organiserId } = req.body;

  try {
    // Find the player by ID
    const player = await Player.findById(playerId);
    if (!player) {
      return res.status(404).json({ message: 'Player not found' });
    }

    // Find the organiser by ID
    const organiser = await Organiser.findById(organiserId);
    if (!organiser) {
      return res.status(404).json({ message: 'Organiser not found' });
    }

    // Check if player is actually following the organiser
    if (!player.following.includes(organiserId)) {
      return res.status(400).json({ message: 'Player is not following this organiser' });
    }

    // Remove the organiser from the player's following list
    player.following.pull(organiserId);
    await player.save();

    // Remove the player from the organiser's followers list
    organiser.followers.pull(playerId);
    await organiser.save();

    res.status(200).json({ message: 'Organiser unfollowed successfully', player, organiser });
  } catch (error) {
    res.status(500).json({ error: 'Error unfollowing organiser' });
  }
};

// Func: Join-Tournmanet                                
//working
exports.joinTournament = async (req, res) => {
  try {
    const { playerId, tournamentId } = req.body;

    const player = await Player.findById(playerId).populate('team');
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

    if (tournament.teams.includes(player.team._id)) {
      return res.status(400).json({ message: 'Team is already registered for this tournament' });
    }

    tournament.teams.push(player.team._id);
    await tournament.save();

    player.tournaments.push({ tournament: tournament._id, won: false });
    await player.save();

    return res.status(200).json({ message: 'Successfully joined the tournament' });
  } catch (error) {
    return res.status(500).json({ message: 'Server error', error });
  }
};
