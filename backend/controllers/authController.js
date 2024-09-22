const Player = require('../models/Player');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
require('dotenv').config();

exports.loginPlayer = async (req, res) => {
    const { username, password } = req.body;

    try {
        const player = await Player.findOne({ username });

        if (!player) {
            return res.status(401).json({ error: 'Invalid username or password' });
        }

        const isPasswordValid = await bcrypt.compare(password, player.password);

        if (!isPasswordValid) {
            return res.status(401).json({ error: 'Invalid username or password' });
        }

        const token = jwt.sign({ id: player._id }, process.env.JWT_SECRET_KEY, {
            expiresIn: '1h'
        });

        res.cookie('user_jwt', token, {
            httpOnly: true,
            maxAge: 3600000,
            secure: process.env.NODE_ENV === 'production'
        });
        

        res.status(200).json({ message: 'Login successful', player });
    } catch (error) {
        console.error('Error during player login:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

