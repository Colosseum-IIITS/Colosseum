const Player = require('../models/Player');
const Organiser = require('../models/Organiser');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
require('dotenv').config();


// Func: Register a new player
exports.createPlayer = async (req, res) => {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
        return res.status(400).json({ message: 'All fields are required' });
    }

    try {
        let existingPlayer = await Player.findOne({ email });
        if (existingPlayer) {
            return res.status(400).json({ message: 'Email already exists' });
        }

        existingPlayer = await Player.findOne({ username });
        if (existingPlayer) {
            return res.status(400).json({ message: 'Username already exists' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const player = new Player({
            username,
            email,
            password: hashedPassword
        });

        await player.save();

        const token = jwt.sign({ id: player._id }, process.env.JWT_SECRET_KEY, { expiresIn: '1h' });

        res.cookie('user_jwt', token, {
            httpOnly: true,
            maxAge: 3600000,
            secure: process.env.NODE_ENV === 'production'
        });

        res.status(201).json({ message: 'Player created successfully', player });
    } catch (error) {
        console.error('Error during player creation:', error);
        res.status(500).json({ error: 'Error creating player', details: error.message });
    }
};

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

// Create a new organizer          
exports.createOrganiser = async (req, res) => {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
        return res.status(400).json({ message: 'All fields are required' });
    }

    try {
        let existingOrg = await Organiser.findOne({ email });
        if (existingOrg) {
            return res.status(400).json({ message: 'Email already exists' });
        }

        existingOrg = await Organiser.findOne({ username });
        if (existingOrg) {
            return res.status(400).json({ message: 'Username already exists' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const organiser = new Organiser({
            username,
            email,
            password: hashedPassword
        });

        await organiser.save();

        const token = jwt.sign({ id: organiser._id }, process.env.JWT_SECRET_KEY, { expiresIn: '1h' });

        res.cookie('user_jwt', token, {
            httpOnly: true,
            maxAge: 3600000,
            secure: process.env.NODE_ENV === 'production'
        });

        res.status(201).json({ message: 'Organiser created successfully', organiser });
    } catch (error) {
        console.error('Error during organiser creation:', error);
        res.status(500).json({ error: 'Error creating organiser', details: error.message });
    }
};

exports.loginOrganiser = async (req, res) => {
    const { username, password } = req.body;

    try {
        const organiser = await Organiser.findOne({ username });

        if (!organiser) {
            return res.status(401).json({ error: 'Invalid username or password' });
        }
        console.log(organiser.password , password);
        const isPasswordValid = await bcrypt.compare(password, organiser.password);

        if (!isPasswordValid) {
            return res.status(401).json({ error: 'Invalid password' });
        }

        const token = jwt.sign({ id: organiser._id }, process.env.JWT_SECRET_KEY, {
            expiresIn: '1h'
        });

        res.cookie('user_jwt', token, {
            httpOnly: true,
            maxAge: 3600000,
            secure: process.env.NODE_ENV === 'production'
        });
        

        res.status(200).json({ message: 'Login successful', organiser });
    } catch (error) {
        console.error('Error during organiser login:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

