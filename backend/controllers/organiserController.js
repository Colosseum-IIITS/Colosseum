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
