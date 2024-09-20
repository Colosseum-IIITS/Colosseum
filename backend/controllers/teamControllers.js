const Team = require('../models/Team');
const Player = require('../models/Player');

exports.createTeam = async (req, res) => {
    const { name, logo, playerId } = req.body;  // Assuming the playerId is the one creating the team
  
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
      const team = new Team({ name, logo, captain: playerId, players: [playerId] });
      await team.save();
  
      // Update the player's team reference
      player.team = team._id;
      await player.save();
  
      res.status(201).json({ message: 'Team created successfully', team });
    } catch (error) {
      res.status(500).json({ error: 'Error creating team' });
    }
  };
  

// Join an existing team
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

exports.fetchTeam = async(req,res)=>{
      try{
        const teamId = req.params.teamId;
        const team = await Team.findById(teamId).populate('players').populate('captain');
        if(!team){
          return res.status(404).json({message:'Team Not Found'})
        }
        res.status(200).json(team);
      } catch(error){
        console.error(error);
        res.status(500).json({message:'Server Error',Error:error.message});
      }
}
