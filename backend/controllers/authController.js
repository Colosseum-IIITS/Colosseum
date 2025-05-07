const Player = require('../models/Player');
const Organiser = require('../models/Organiser');
const Admin = require('../models/Admin');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
require('dotenv').config();

// Register a new player
const nodemailer = require('nodemailer');

exports.createPlayer = async (req, res) => {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
        return res.status(400).json({ statusCode: 400, errorMessage: 'Invalid Details' });
    }

    // Ensure email ends with @gmail.com
    if (!email.endsWith('@gmail.com')) {
        return res.status(400).json({ statusCode: 400, errorMessage: 'Only Gmail addresses are allowed' });
    }

    try {
        let existingPlayer = await Player.findOne({ email });
        if (existingPlayer) {
            return res.status(400).json({ statusCode: 400, errorMessage: 'Email already taken!' });
        }

        existingPlayer = await Player.findOne({ username });
        if (existingPlayer) {
            return res.status(400).json({ statusCode: 400, errorMessage: 'Username already exists!' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const player = new Player({
            username,
            email,
            password: hashedPassword
        });

        await player.save();

        const token = jwt.sign({ id: player._id, role: 'player' }, process.env.JWT_SECRET_KEY, { expiresIn: '24h' });

        // Set cookie with SameSite=None for cross-domain
        res.cookie('user_jwt', token, {
            httpOnly: true,
            maxAge: 86400000, // 24 hours
            secure: true, // Always use secure cookies for cross-domain
            sameSite: 'None', // Required for cross-domain cookies
            path: '/'
        });

        // Send confirmation email
        await sendConfirmationEmail(email, username);

        // Return the token in the response body for localStorage
        res.status(201).json({ 
            message: 'Player registered successfully', 
            token,
            user: {
                id: player._id,
                username: player.username,
                email: player.email,
                role: 'player'
            }
        });
    } catch (error) {
        console.error('Error during player creation:', error.message);
        res.status(500).json({ statusCode: 500, errorMessage: 'Internal Server Error' });
    }
};

// Function to send confirmation email
const sendConfirmationEmail = async (email, username) => {
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user:process.env.EMAIL_USER, // Your Gmail
            pass:  process.env.EMAIL_PASS   // App Password
        }
    });

    const mailOptions = {
        from:process.env.EMAIL_USER,
        to: email,
        subject: 'Welcome to Tournament Platform!',
        text: `Hello ${username},\n\nWelcome! Your account has been successfully created.\n\nBest Regards,\nTournament Team`
    };

    await transporter.sendMail(mailOptions);
};


// Player login
exports.loginPlayer = async (req, res) => {
    const { username, password } = req.body;

    try {
        // Find the player by username
        const player = await Player.findOne({ username });
        if (!player) {
            return res.status(401).json({ statusCode: 401, errorMessage: 'Player not found' });
        }

        // Compare the provided password with the hashed password in the database
        const isPasswordValid = await bcrypt.compare(password, player.password);
        if (!isPasswordValid) {
            return res.status(401).json({ statusCode: 401, errorMessage: 'Invalid username or password' });
        }

        // Check if the player is banned
        if (player.banned) {
            return res.status(403).json({ statusCode: 403, errorMessage: 'Player is banned' });
        }

        // Create a JWT token with the player's ID and role as 'player'
        const token = jwt.sign(
            { id: player._id, role: 'player' },
            process.env.JWT_SECRET_KEY,
            { expiresIn: '24h' }
        );

        // Set the token as an HttpOnly cookie with SameSite=None for cross-domain
        res.cookie('user_jwt', token, {
            httpOnly: true,
            maxAge: 86400000, // 24 hours
            secure: true, // Always use secure cookies for cross-domain
            sameSite: 'None', // Required for cross-domain cookies
            path: '/'
        });

        // Return the token in the response body for localStorage
        res.status(200).json({ 
            message: 'Login successful', 
            token,
            user: {
                id: player._id,
                username: player.username,
                email: player.email,
                role: 'player'
            }
        });
    } catch (error) {
        console.error('Error during player login:', error);
        res.status(500).json({ statusCode: 500, errorMessage: 'Internal Server Error' });
    }
};

// Register a new organiser
exports.createOrganiser = async (req, res) => {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
        return res.status(400).json({ statusCode: 400, errorMessage: 'Invalid Details' });
    }

    try {
        let existingOrg = await Organiser.findOne({ email });
        if (existingOrg) {
            return res.status(400).json({ statusCode: 400, errorMessage: 'Email already taken!' });
        }

        existingOrg = await Organiser.findOne({ username });
        if (existingOrg) {
            return res.status(400).json({ statusCode: 400, errorMessage: 'Username already exists!' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const organiser = new Organiser({
            username,
            email,
            password: hashedPassword
        });

        await organiser.save();

        const token = jwt.sign({ id: organiser._id, role: 'organiser' }, process.env.JWT_SECRET_KEY, { expiresIn: '24h' });

        // Set cookie with SameSite=None for cross-domain
        res.cookie('user_jwt', token, {
            httpOnly: true,
            maxAge: 86400000, // 24 hours
            secure: true, // Always use secure cookies for cross-domain
            sameSite: 'None', // Required for cross-domain cookies
            path: '/'
        });

        // Return the token in the response body for localStorage
        res.status(201).json({ 
            message: 'Organiser registered successfully', 
            token,
            user: {
                id: organiser._id,
                username: organiser.username,
                email: organiser.email,
                role: 'organiser'
            }
        });
    } catch (error) {
        console.error('Error during organiser creation:', error);
        res.status(500).json({ statusCode: 500, errorMessage: 'Internal Server Error' });
    }
};

// Organiser login
exports.loginOrganiser = async (req, res) => {
    const { username, password } = req.body;

    try {
        // Find organiser by username
        const organiser = await Organiser.findOne({ username });
        if (!organiser) {
            return res.status(401).json({ statusCode: 401, errorMessage: 'Organiser not found' });
        }

        // Compare the provided password with the hashed password in the database
        const isPasswordValid = await bcrypt.compare(password, organiser.password);
        if (!isPasswordValid) {
            return res.status(401).json({ statusCode: 401, errorMessage: 'Invalid username or password' });
        }

        // Check if the organiser is banned
        if (organiser.banned) {
            return res.status(403).json({ statusCode: 403, errorMessage: 'Organiser is banned' });
        }

        // Create a JWT token with the organiser's ID and role
        const token = jwt.sign(
            { id: organiser._id, role: 'organiser' },
            process.env.JWT_SECRET_KEY,
            { expiresIn: '24h' }
        );

        // Set the token as an HttpOnly cookie with SameSite=None for cross-domain
        res.cookie('user_jwt', token, {
            httpOnly: true,
            maxAge: 86400000, // 24 hours
            secure: true, // Always use secure cookies for cross-domain
            sameSite: 'None', // Required for cross-domain cookies
            path: '/'
        });

        // Return the token in the response body for localStorage
        res.status(200).json({ 
            message: 'Login successful', 
            token,
            user: {
                id: organiser._id,
                username: organiser.username,
                email: organiser.email,
                role: 'organiser'
            }
        });
    } catch (error) {
        console.error('Error during organiser login:', error);
        res.status(500).json({ statusCode: 500, errorMessage: 'Internal Server Error' });
    }
};


// Register a new admin
exports.createAdmin = async (req, res) => {
    const { username, email, password } = req.body;

    try {
        const existingAdmin = await Admin.findOne({ username });
        if (existingAdmin) {
            return res.status(400).json({ message: 'Admin already exists' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newAdmin = new Admin({
            username,
            email,
            password: hashedPassword
        });

        await newAdmin.save();
        const token = jwt.sign({ id: newAdmin._id, role: 'admin' }, process.env.JWT_SECRET_KEY, { expiresIn: '24h' });

        // Set cookie with SameSite=None for cross-domain
        res.cookie('user_jwt', token, {
            httpOnly: true,
            maxAge: 86400000, // 24 hours
            secure: true, // Always use secure cookies for cross-domain
            sameSite: 'None', // Required for cross-domain cookies
            path: '/'
        });

        // Return the token in the response body for localStorage
        res.status(201).json({ 
            message: 'Admin registered successfully',
            token,
            user: {
                id: newAdmin._id,
                username: newAdmin.username,
                email: newAdmin.email,
                role: 'admin'
            }
        });
    } catch (error) {
        console.error('Error creating admin:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Admin login
exports.loginAdmin = async (req, res) => {
    const { username, password } = req.body;

    try {
        const admin = await Admin.findOne({ username });
        if (!admin) {
            return res.status(401).json({ statusCode: 401, errorMessage: 'Invalid username or password' });
        }

        const isPasswordValid = await bcrypt.compare(password, admin.password);
        if (!isPasswordValid) {
            return res.status(401).json({ statusCode: 401, errorMessage: 'Invalid username or password' });
        }

        // Create a JWT token with the user ID and role
        const token = jwt.sign(
            { id: admin._id, role: 'admin' },
            process.env.JWT_SECRET_KEY,
            { expiresIn: '24h' }
        );

        // Set the token as an HttpOnly cookie with SameSite=None for cross-domain
        res.cookie('user_jwt', token, {
            httpOnly: true,
            maxAge: 86400000, // 24 hours
            secure: true, // Always use secure cookies for cross-domain
            sameSite: 'None', // Required for cross-domain cookies
            path: '/'
        });

        // Return the token in the response body for localStorage
        res.status(200).json({
            message: 'Login successful',
            token,
            user: {
                id: admin._id,
                username: admin.username,
                email: admin.email,
                role: 'admin'
            }
        });
    } catch (error) {
        console.error('Error during admin login:', error);
        res.status(500).json({ statusCode: 500, errorMessage: 'Internal Server Error' });
    }
};

// Signout
exports.signout = (req, res) => {
    res.cookie('user_jwt', '', {
        httpOnly: true,
        secure: true,
        sameSite: 'None',
        path: '/',
        expires: new Date(0) // Expire immediately
    });
    res.status(200).json({ message: 'Signed out successfully' });
};
