const Player = require('../models/Player');
const Organiser = require('../models/Organiser');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
require('dotenv').config();


// Func: Register a new player
exports.createPlayer = async (req, res) => {
    const { username, email, password } = req.body;

    console.log('Request Body:', req.body); // Log the request body

    if (!username || !email || !password) {
        return res.status(400).render( 'error' , {statusCode:'400' ,errorMessage:'Invalid Details'});
    }

    try {
        console.log('JWT_SECRET_KEY:', process.env.JWT_SECRET_KEY);

        let existingPlayer = await Player.findOne({ email });
        if (existingPlayer) {
            return res.status(400).render( 'error' , {statusCode:'400' ,errorMessage:'Email already taken!!'});
        }

        existingPlayer = await Player.findOne({ username });
        if (existingPlayer) {
            return res.status(400).render( 'error' , {statusCode:'400' ,errorMessage:'Username already Exists!!'});
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

        // Instead of returning JSON, redirect to the signin page
        res.redirect('/signin?role=player'); // Redirect to /signin
    } catch (error) {
        console.error('Error during player creation:', error, error.message);
        res.status(500).render( 'error' , {statusCode:'400' ,errorMessage: 'Internal Server Error!!'});
    }
};

exports.loginPlayer = async (req, res) => {
    const { username, password } = req.body;
    try {
        const player = await Player.findOne({ username });
        if (!player) {
            return res.status(401).render( 'error' , {statusCode:'401' ,errorMessage:'Player not found'});
        }

        const isPasswordValid = await bcrypt.compare(password, player.password);
        if (!isPasswordValid) {
            return res.status(401).render( 'error' , {statusCode:'401' ,errorMessage:'Invalid username or password'});
        }

        const banStatus = player.banned;
        if(banStatus) {
            return res.status(308).render( 'error' , {statusCode:'308' ,errorMessage:'Ohh!!, You;re Banned'});
        }

        const token = jwt.sign({ id: player._id }, process.env.JWT_SECRET_KEY, { expiresIn: '1h' });
        res.cookie('user_jwt', token, { httpOnly: true, maxAge: 3600000, secure: process.env.NODE_ENV === 'production' });


        res.status(200).json({ message: 'Login successful', player });
    
    } catch (error) {
        console.error('Error during player login:', error);
        return res.status(500).render( 'error' , {statusCode:'500' ,errorMessage:'Internal server error'});
    }
};

// Create a new organizer          
exports.createOrganiser = async (req, res) => {
    console.log('Organiser signup request:', req.body);
    const { username, email, password } = req.body;
    if (!username || !email || !password) {
        return res.status(400).render( 'error' , {statusCode:'400' ,errorMessage:'Invalid Details'});
    }

    try {
        let existingOrg = await Organiser.findOne({ email });
        if (existingOrg) {
            return res.status(400).render( 'error' , {statusCode:'400' ,errorMessage:'Email already taken!!'});
        }

        existingOrg = await Organiser.findOne({ username });
        if (existingOrg) {
            return res.status(400).render( 'error' , {statusCode:'400' ,errorMessage:'Username already Exists!!'});
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

        res.redirect('/signin?role=organiser');
    } catch (error) {
        console.error('Error during organiser creation:', error);
        res.status(500).render( 'error' , {statusCode:'400' ,errorMessage: 'Internal Server Error!!'});
    }
};

exports.loginOrganiser = async (req, res) => {
    console.log('Login attempt for organiser:', req.body.username);
    const { username, password } = req.body;

    try {
        const organiser = await Organiser.findOne({ username });
        console.log('Found organiser:', organiser);

        if (!organiser) {
            console.log('Organiser not found');
            return res.status(401).render( 'error' , {statusCode:'401' ,errorMessage:'Organiser not found'});
        }

        const isPasswordValid = await bcrypt.compare(password, organiser.password);
        console.log('Password valid:', isPasswordValid);

        const banStatus = organiser.banned;
        if(banStatus) {
            return res.status(308).render( 'error' , {statusCode:'308' ,errorMessage:'Ohh!!, You;re Banned'});
        }

        if (!isPasswordValid) {
            return res.status(401).render( 'error' , {statusCode:'401' ,errorMessage:'Invalid username or password'});
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
        return res.status(500).render( 'error' , {statusCode:'500' ,errorMessage:'Internal server error'});
    }
};


