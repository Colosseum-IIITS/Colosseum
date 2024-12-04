const mongoose = require('mongoose');
const BanHistory = require('../models/BanHistory'); // Assuming you have this model defined

// Test Data
const testBanHistory = [
    {
        bannedEntity: '66f62d63b209bb9c579d0210', // Replace with actual player or organiser IDs
        entityType: 'Player', // Correct field name
        reason: 'Cheating in tournament',
        date: new Date('2024-11-15T10:00:00Z'), // Date within the last month
        active: true
    },
    {
        bannedEntity: '66f2adda90408ef0866d4087', // Replace with actual organiser ID
        entityType: 'Organiser', // Correct field name
        reason: 'Manipulating tournament results',
        date: new Date('2024-10-01T10:00:00Z'), // Date outside the last month
        active: true
    },
    {
        bannedEntity: '66f62b7db209bb9c579d01e0', // Replace with actual player ID
        entityType: 'Player', // Correct field name
        reason: 'Abusive behavior',
        date: new Date('2024-09-10T10:00:00Z'), // Date outside the last month
        active: false
    }
];

// Insert test data into the database
mongoose.connect('mongodb://localhost:27017/tournamentDB', { useNewUrlParser: true, useUnifiedTopology: true })
    .then(async () => {
        console.log('Connected to MongoDB');

        // Clear existing ban history for clean testing
        await BanHistory.deleteMany({});
        
        // Insert test data
        const insertedBanHistory = await BanHistory.insertMany(testBanHistory);
        console.log('Inserted BanHistory:', insertedBanHistory);

        mongoose.disconnect();
    })
    .catch((error) => {
        console.error('Error connecting to MongoDB', error);
    });
