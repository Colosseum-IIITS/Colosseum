const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const Player = require('../models/Player');
const Organiser = require('../models/Organiser');
const Tournament = require('../models/Tournament');
const Team = require('../models/Team');
const Report = require('../models/Report');
const BanHistory = require('../models/BanHistory');

const connectDB = async () => {
  try {
    await mongoose.connect('mongodb://localhost:27017/tournamentDB', {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('MongoDB connected');
  } catch (err) {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  }
};

const clearDB = async () => {
  await Player.deleteMany({});
  await Organiser.deleteMany({});
  await Tournament.deleteMany({});
  await Team.deleteMany({});
  await Report.deleteMany({});
  await BanHistory.deleteMany({});
  console.log('Database cleared');
};

const generateTestData = async () => {
  try {
    // Create players
    const hashedPassword = await bcrypt.hash('password123', 10);
    const players = [];
    for (let i = 1; i <= 10; i++) {
      const player = await Player.create({
        username: `player${i}`,
        email: `player${i}@gmail.com`,
        password: hashedPassword
      });
      players.push(player);
    }
    console.log('Players created');

    // Create organisers
    const organisers = [];
    for (let i = 1; i <= 5; i++) {
      const organiser = await Organiser.create({
        username: `organiser${i}`,
        email: `organiser${i}@gmail.com`,
        password: hashedPassword,
        description: `Test organiser ${i} description`,
        rating: Math.floor(Math.random() * 5) + 1,
        totalRevenue: Math.floor(Math.random() * 10000)
      });
      organisers.push(organiser);
    }
    console.log('Organisers created');

    // Create teams
    const teams = [];
    for (let i = 1; i <= 5; i++) {
      const team = await Team.create({
        name: `Team${i}`,
        leader: players[i-1]._id,
        members: [players[i-1]._id, players[i+4]._id],
        description: `Test team ${i} description`
      });
      teams.push(team);
    }
    console.log('Teams created');

    // Create tournaments
    const tournaments = [];
    const currentDate = new Date();
    for (let i = 1; i <= 10; i++) {
      const startDate = new Date(currentDate);
      startDate.setDate(currentDate.getDate() + i);
      const endDate = new Date(startDate);
      endDate.setDate(startDate.getDate() + 7);

      const tournament = await Tournament.create({
        tid: `T${i}`,
        name: `Tournament ${i}`,
        startDate,
        endDate,
        entryFee: Math.floor(Math.random() * 1000),
        prizePool: Math.floor(Math.random() * 10000),
        status: i % 3 === 0 ? 'Completed' : i % 2 === 0 ? 'Approved' : 'Pending',
        organiser: organisers[i % 5]._id,
        teams: teams.map(team => team._id),
        description: `Test tournament ${i} description`,
        revenue: Math.floor(Math.random() * 5000)
      });
      tournaments.push(tournament);

      // Update organiser with tournament
      await Organiser.findByIdAndUpdate(
        organisers[i % 5]._id,
        { $push: { tournaments: tournament._id } }
      );
    }
    console.log('Tournaments created');

    // Create reports
    for (let i = 1; i <= 5; i++) {
      await Report.create({
        reportedBy: players[i-1]._id,
        reportType: i % 2 === 0 ? 'Team' : 'Organiser',
        reportedTeam: i % 2 === 0 ? teams[i-1].name : undefined,
        reportedOrganiser: i % 2 === 0 ? undefined : organisers[i-1]._id,
        reason: `Test report ${i} reason`,
        status: i % 2 === 0 ? 'Pending' : 'Reviewed'
      });
    }
    console.log('Reports created');

    // Create ban history
    for (let i = 1; i <= 3; i++) {
      await BanHistory.create({
        bannedEntity: i % 2 === 0 ? players[i-1]._id : organisers[i-1]._id,
        entityType: i % 2 === 0 ? 'Player' : 'Organiser',
        reason: `Test ban ${i} reason`,
        date: new Date(),
        active: true
      });
    }
    console.log('Ban history created');

    // Update player teams and following
    for (let i = 0; i < players.length; i++) {
      await Player.findByIdAndUpdate(players[i]._id, {
        team: teams[i % 5]._id,
        following: [organisers[i % 5]._id]
      });
    }
    console.log('Player relationships updated');

    console.log('All test data created successfully');
  } catch (err) {
    console.error('Error generating test data:', err);
  }
};

const runPopulation = async () => {
  await connectDB();
  await clearDB();
  await generateTestData();
  process.exit(0);
};

runPopulation();