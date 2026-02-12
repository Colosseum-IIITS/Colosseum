const ApiKey = require('../models/ApiKey');

/**
 * Middleware to authenticate requests using API keys
 * Used for B2B integrations
 */
exports.authenticateApiKey = async (req, res, next) => {
    try {
        // Get API key from header
        const apiKey = req.header('X-API-Key');
        
        if (!apiKey) {
            return res.status(401).json({ message: 'API key is required' });
        }
        
        // Find the API key in the database
        const keyDoc = await ApiKey.findOne({ key: apiKey, active: true });
        
        if (!keyDoc) {
            return res.status(401).json({ message: 'Invalid API key' });
        }
        
        // Check if the key has expired
        if (keyDoc.expiresAt < new Date()) {
            return res.status(401).json({ message: 'API key has expired' });
        }
        
        // Update last used timestamp
        keyDoc.lastUsed = new Date();
        await keyDoc.save();
        
        // Attach API key info to the request
        req.user = { 
            apiKey: keyDoc.key,
            partnerId: keyDoc.partnerId,
            permissions: keyDoc.permissions
        };
        
        next();
    } catch (error) {
        console.error('API key authentication error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};
