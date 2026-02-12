const Tournament = require('../models/Tournament');
const Player = require('../models/Player');
const Team = require('../models/Team');
const Webhook = require('../models/Webhook'); // You'll need to create this model
const { getCache, setCache } = require('../utils/redisClient');

/**
 * Get tournament data for integration partners
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.getTournaments = async (req, res) => {
    try {
        const { status } = req.query;
        const limit = parseInt(req.query.limit) || 50;
        
        // Attempt to get from cache first
        const cacheKey = `integration_tournaments_${status || 'all'}_${limit}`;
        const cachedData = await getCache(cacheKey);
        
        if (cachedData) {
            return res.status(200).json(JSON.parse(cachedData));
        }
        
        // Build query
        let query = {};
        if (status) {
            query.status = status;
        }
        
        // Fetch tournaments with projection to limit returned fields
        const tournaments = await Tournament.find(query)
            .select('tid name startDate endDate entryFee prizePool status organiser description winner')
            .limit(limit)
            .lean();
            
        const result = { data: tournaments };
        
        // Cache the result
        await setCache(cacheKey, JSON.stringify(result), 60 * 5); // Cache for 5 minutes
        
        res.status(200).json(result);
    } catch (error) {
        console.error('Error fetching tournament data:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

/**
 * Register a webhook for integration events
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.registerWebhook = async (req, res) => {
    try {
        const { url, events } = req.body;
        const { apiKey } = req.user; // Assuming apiKey is attached by middleware
        
        if (!url || !events || !Array.isArray(events) || events.length === 0) {
            return res.status(400).json({ message: 'Invalid request parameters' });
        }
        
        // Validate each event is allowed
        const allowedEvents = ['tournament.created', 'tournament.updated', 'tournament.completed', 'team.joined'];
        const validEvents = events.every(event => allowedEvents.includes(event));
        
        if (!validEvents) {
            return res.status(400).json({ 
                message: 'Invalid event type. Allowed events are: ' + allowedEvents.join(', ')
            });
        }
        
        // Create new webhook
        const webhook = new Webhook({
            url,
            events,
            apiKey,
            createdAt: new Date()
        });
        
        await webhook.save();
        
        res.status(201).json({
            id: webhook._id,
            url: webhook.url,
            events: webhook.events
        });
    } catch (error) {
        console.error('Error registering webhook:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

/**
 * Get global player leaderboard data
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.getLeaderboard = async (req, res) => {
    try {
        const { game } = req.query;
        const limit = parseInt(req.query.limit) || 100;
        
        // Attempt to get from cache first
        const cacheKey = `leaderboard_${game || 'all'}_${limit}`;
        const cachedData = await getCache(cacheKey);
        
        if (cachedData) {
            return res.status(200).json(JSON.parse(cachedData));
        }
        
        // Aggregate players based on tournaments won
        const players = await Player.aggregate([
            {
                $project: {
                    _id: 1,
                    username: 1,
                    tournamentsCount: { $size: "$tournaments" },
                    tournamentsWon: {
                        $size: {
                            $filter: {
                                input: "$tournaments",
                                as: "tournament",
                                cond: { $eq: ["$$tournament.won", true] }
                            }
                        }
                    }
                }
            },
            { $sort: { tournamentsWon: -1, tournamentsCount: -1 } },
            { $limit: limit }
        ]);
        
        // Format the results
        const leaderboardData = players.map((player, index) => ({
            playerName: player.username,
            playerId: player._id,
            rank: index + 1,
            score: player.tournamentsWon * 100 + player.tournamentsCount * 10, // Example scoring formula
            tournamentsWon: player.tournamentsWon
        }));
        
        const result = { data: leaderboardData };
        
        // Cache the result
        await setCache(cacheKey, JSON.stringify(result), 60 * 15); // Cache for 15 minutes
        
        res.status(200).json(result);
    } catch (error) {
        console.error('Error fetching leaderboard data:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

/**
 * Get detailed team information
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.getTeamDetails = async (req, res) => {
    try {
        const { teamId } = req.query;
        
        if (!teamId) {
            return res.status(400).json({ message: 'Team ID is required' });
        }
        
        const team = await Team.findById(teamId)
            .populate('players', 'username')
            .populate('captain', 'username')
            .lean();
            
        if (!team) {
            return res.status(404).json({ message: 'Team not found' });
        }
        
        res.status(200).json(team);
    } catch (error) {
        console.error('Error fetching team details:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};
