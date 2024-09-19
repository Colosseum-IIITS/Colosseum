const jwt = require('jsonwebtoken');

// Function to generate a JWT token with the user ID as payload
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d',  // Token expires in 30 days
  });
};

module.exports = generateToken;
