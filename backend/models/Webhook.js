const mongoose = require('mongoose');

const webhookSchema = new mongoose.Schema({
    url: {
        type: String,
        required: true,
        trim: true
    },
    events: {
        type: [String],
        required: true,
        enum: ['tournament.created', 'tournament.updated', 'tournament.completed', 'team.joined']
    },
    apiKey: {
        type: String,
        required: true,
        ref: 'ApiKey'
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    lastTriggered: {
        type: Date
    },
    active: {
        type: Boolean,
        default: true
    }
});

module.exports = mongoose.model('Webhook', webhookSchema);
