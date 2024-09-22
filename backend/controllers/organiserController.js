const Organiser = require('../models/Organiser');

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
