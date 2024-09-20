// dummy code

const Organiser = require('../models/Organiser');

// Create a new organizer
exports.createOrganiser = async (req, res) => {
  const { username, email, password, profilePhoto, description } = req.body;

  try {
    // Check if email or username already exists
    const existingOrganiser = await Organiser.findOne({ $or: [{ email }, { username }] });
    if (existingOrganiser) {
      return res.status(400).json({ message: 'Email or Username already exists' });
    }

    // Create new organizer
    const organiser = new Organiser({
      username,
      email,
      password,
      profilePhoto,
      description,
    });

    await organiser.save();
    res.status(201).json({ message: 'Organiser created successfully', organiser });
  } catch (error) {
    res.status(500).json({ error: 'Error creating organiser' });
  }
};


// Search Organisation
exports.getOrganiserByUsername = async (req, res) => {
  const { searchTerm } = req.query;  // Search term will be passed as a query parameter

  try {
      // Perform a case-insensitive search on the organiser username
      const organiser = await Organiser.findOne({ username: { $regex: new RegExp(searchTerm, 'i') } })
          .populate('followers')  // Populate followers details
          .populate('tournaments');  // Populate tournaments organised by the organiser

      // Check if the organiser exists
      if (!organiser) {
          return res.status(404).json({ message: 'Organiser not found' });
      }

      res.status(200).json({ organiser });
  } catch (error) {
      console.error('Error fetching organiser:', error);
      res.status(500).json({ error: 'Error fetching organiser', details: error.message });
  }
};
