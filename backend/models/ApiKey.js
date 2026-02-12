const mongoose = require('mongoose');
const crypto = require('crypto');

const apiKeySchema = new mongoose.Schema({
    key: {
        type: String,
        required: true,
        unique: true
    },
    name: {
        type: String,
        required: true,
        trim: true
    },
    partnerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Partner',
        required: true
    },
    permissions: {
        type: [String],
        default: ['read']
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    expiresAt: {
        type: Date,
        required: true
    },
    lastUsed: {
        type: Date
    },
    active: {
        type: Boolean,
        default: true
    }
});

// Static method to generate a new API key
apiKeySchema.statics.generateApiKey = function (name, partnerId, permissions = ['read'], expiresInDays = 365) {
    const key = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + expiresInDays);
    
    return new this({
        key,
        name,
        partnerId,
        permissions,
        expiresAt
    });
};

module.exports = mongoose.model('ApiKey', apiKeySchema);
