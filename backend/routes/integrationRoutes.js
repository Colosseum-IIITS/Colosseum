const express = require('express');
const router = express.Router();
const { authenticateApiKey } = require('../middleware/authMiddleware');

/**
 * @swagger
 * tags:
 *   name: Integration
 *   description: B2B API endpoints for external system integration
 */

/**
 * @swagger
 * /api/integration/tournaments:
 *   get:
 *     tags: [Integration]
 *     summary: "Get tournament data for integration partners"
 *     description: "This endpoint provides tournament data for external system integration."
 *     security:
 *       - ApiKeyAuth: []
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 50
 *         description: "Maximum number of records to return"
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [Pending, Approved, Completed]
 *         description: "Filter by tournament status"
 *     responses:
 *       "200":
 *         description: "Successfully retrieved tournament data"
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Tournament'
 *       "401":
 *         description: "Unauthorized - Invalid API key"
 *       "500":
 *         description: "Internal server error"
 */
router.get('/tournaments', authenticateApiKey, async (req, res) => {
    try {
        const { status } = req.query;
        const limit = parseInt(req.query.limit) || 50;
        
        // Implementation will fetch tournament data
        // and return in the format defined in the swagger docs
        
        res.status(200).json({
            // Sample response format, replace with actual implementation
            data: []
        });
    } catch (error) {
        console.error('Error fetching tournament data:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

/**
 * @swagger
 * /api/integration/webhooks:
 *   post:
 *     tags: [Integration]
 *     summary: "Register a webhook for integration events"
 *     description: "This endpoint allows external partners to register webhooks for event notifications."
 *     security:
 *       - ApiKeyAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - url
 *               - events
 *             properties:
 *               url:
 *                 type: string
 *                 format: uri
 *                 description: "The URL where webhook events will be sent"
 *               events:
 *                 type: array
 *                 items:
 *                   type: string
 *                   enum: [tournament.created, tournament.updated, tournament.completed, team.joined]
 *                 description: "Events to subscribe to"
 *     responses:
 *       "201":
 *         description: "Webhook registered successfully"
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                 url:
 *                   type: string
 *                 events:
 *                   type: array
 *                   items:
 *                     type: string
 *       "400":
 *         description: "Invalid request body"
 *       "401":
 *         description: "Unauthorized - Invalid API key"
 *       "500":
 *         description: "Internal server error"
 */
router.post('/webhooks', authenticateApiKey, async (req, res) => {
    try {
        const { url, events } = req.body;
        
        if (!url || !events || !Array.isArray(events) || events.length === 0) {
            return res.status(400).json({ message: 'Invalid request parameters' });
        }
        
        // Implementation will register the webhook in the database
        // and return the webhook ID
        
        res.status(201).json({
            // Sample response format, replace with actual implementation
            id: 'webhook_' + Date.now(),
            url,
            events
        });
    } catch (error) {
        console.error('Error registering webhook:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

/**
 * @swagger
 * /api/integration/leaderboard:
 *   get:
 *     tags: [Integration]
 *     summary: "Get global player leaderboard data"
 *     description: "This endpoint provides global player ranking data for external system integration."
 *     security:
 *       - ApiKeyAuth: []
 *     parameters:
 *       - in: query
 *         name: game
 *         schema:
 *           type: string
 *         description: "Filter by game type"
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 100
 *         description: "Maximum number of records to return"
 *     responses:
 *       "200":
 *         description: "Successfully retrieved leaderboard data"
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       playerName:
 *                         type: string
 *                       playerId:
 *                         type: string
 *                       rank:
 *                         type: integer
 *                       score:
 *                         type: number
 *                       tournamentsWon:
 *                         type: integer
 *       "401":
 *         description: "Unauthorized - Invalid API key"
 *       "500":
 *         description: "Internal server error"
 */
router.get('/leaderboard', authenticateApiKey, async (req, res) => {
    try {
        const { game } = req.query;
        const limit = parseInt(req.query.limit) || 100;
        
        // Implementation will fetch leaderboard data
        // and return in the format defined in the swagger docs
        
        res.status(200).json({
            // Sample response format, replace with actual implementation
            data: []
        });
    } catch (error) {
        console.error('Error fetching leaderboard data:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

/**
 * @swagger
 * /api/integration/teams/details:
 *   get:
 *     tags: [Integration]
 *     summary: "Get detailed team information"
 *     description: "This endpoint provides detailed team information for integration partners."
 *     security:
 *       - ApiKeyAuth: []
 *     parameters:
 *       - in: query
 *         name: teamId
 *         schema:
 *           type: string
 *         description: "Team ID to get details for"
 *         required: true
 *     responses:
 *       "200":
 *         description: "Successfully retrieved team details"
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Team'
 *       "401":
 *         description: "Unauthorized - Invalid API key"
 *       "404":
 *         description: "Team not found"
 *       "500":
 *         description: "Internal server error"
 */
router.get('/teams/details', authenticateApiKey, async (req, res) => {
    try {
        const { teamId } = req.query;
        
        if (!teamId) {
            return res.status(400).json({ message: 'Team ID is required' });
        }
        
        // Implementation will fetch team details
        
        res.status(200).json({
            // Sample response format, replace with actual implementation
            id: teamId,
            name: 'Sample Team',
            // Other team details
        });
    } catch (error) {
        console.error('Error fetching team details:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

module.exports = router;
