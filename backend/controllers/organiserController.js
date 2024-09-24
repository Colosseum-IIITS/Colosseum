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


exports.updateUsername = async (req, res) => {
    const { newUsername } = req.body;
    const { _id } = req.user;

    try {
        const organiser = await Organiser.findOne({ _id });
        if (!organiser) {
            return res.status(404).json({ message: 'Organiser not found' });
        }

        const existingOrganiser = await Organiser.findOne({ username: newUsername });
        if (existingOrganiser) {
            return res.status(400).json({ message: 'Username already taken' });
        }

        organiser.username = newUsername;
        await organiser.save();

        res.status(200).json({ message: 'Username updated successfully', organiser });
    } catch (error) {
        console.error('Error updating username:', error);
        res.status(500).json({ error: 'Error updating username', details: error.message });
    }
};


exports.updateEmail = async (req, res) => {
    const { newEmail } = req.body;
    const { _id } = req.user;

    try {
        const organiser = await Organiser.findOne({ _id });
        if (!organiser) {
            return res.status(404).json({ message: 'Organiser not found' });
        }

        const existingOrganiser = await Organiser.findOne({ email:newEmail  });
        if (existingOrganiser) {
            return res.status(400).json({ message: 'Username already taken' });
        }

        organiser.email = newEmail;
        await organiser.save();

        res.status(200).json({ message: 'Email updated successfully', organiser });
    } catch (error) {
        console.error('Error updating Email:', error);
        res.status(500).json({ error: 'Error updating Email', details: error.message });
    
}
};

exports.updatePassword = async (req, res) => {
    const { currentPassword, newPassword } = req.body;
    const { _id } = req.user;

    console.log('Updating password for:', _id); 
    try {
        const organiser = await Organiser.findOne({ _id });
        if (!organiser) {
            return res.status(404).json({ message: 'Organiser not found' });
        }

        const isMatch = await bcrypt.compare(currentPassword, organiser.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'New Password Cannot be the Same as Old Password' });
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);
        player.password = hashedPassword;
        await organiser.save();

        res.status(200).json({ message: 'Password updated successfully' });
    } catch (error) {
        console.error('Error updating password:', error);
        res.status(500).json({ error: 'Error updating password', details: error.message });
    }
};




exports.updateDescription = async (req, res) => {
    const { newDescription } = req.body;
    const { _id } = req.user;

    try {
        const organiser = await Organiser.findOne({ _id });
        if (!organiser) {
            return res.status(404).json({ message: 'Organiser not found' });
        }

        organiser.description = newDescription;
        await organiser.save();

        res.status(200).json({ message: 'Description updated successfully', organiser });
    } catch (error) {
        console.error('Error updating description:', error);
        res.status(500).json({ error: 'Error updating description', details: error.message });
    }
};

exports.updateProfilePhoto = async (req, res) => {
    const { newProfilePhoto } = req.body;
    const { _id } = req.user;

    try {
        const organiser = await Organiser.findOne({ _id });
        if (!organiser) {
            return res.status(404).json({ message: 'Organiser not found' });
        }

        organiser.profilePhoto = newProfilePhoto;
        await organiser.save();

        res.status(200).json({ message: 'Profile Photo updated successfully', organiser });
    } catch (error) {
        console.error('Error updating Profile Photo:', error);
        res.status(500).json({ error: 'Error updating Profile Photo', details: error.message });
    }
};



// Route Has Been Tested and Is working successfully

    
// create update organiserdetails <DONE> 
// update passwords  <DONE>
// Dashboards with details-->{
//      Tournaments Conducted:
//      Total People in the Org:
//      total people played with the Org:
//      Total prizepool
//      current Matches
//      upcoming Matches
//      completed matches
//      }
// Ban Teams from organiser
// Ban Players from organiser
