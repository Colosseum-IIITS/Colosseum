// swaggerDocs.js

module.exports = {
    Admin: {
        type: 'object',
        required: ['username', 'email', 'password'],
        properties: {
            username: { type: 'string', unique: true, description: 'The username of the admin' },
            email: { type: 'string', unique: true, description: 'The email address of the admin' },
            password: { type: 'string', description: 'The password for the admin account' }
        }
    },
    Organiser: {
        type: 'object',
        required: ['username', 'email', 'password'],
        properties: {
            username: { type: 'string', unique: true, description: 'The username of the organiser' },
            email: { type: 'string', unique: true, description: 'The email of the organiser' },
            password: { type: 'string', description: 'The password for the organiser account' },
            profilePhoto: { type: 'string', description: 'URL of the organiser\'s profile photo' },
            description: { type: 'string', description: 'A brief description of the organiser' },
            followers: { type: 'array', items: { type: 'string' }, description: 'List of followers' },
            tournamentsConducted: { type: 'number', description: 'Total number of tournaments conducted by the organiser' },
            rating: { type: 'number', description: 'Rating of the organiser' },
            tournaments: { type: 'array', items: { type: 'string' }, description: 'List of tournaments associated with the organiser' },
            bannedTeams: { type: 'array', items: { type: 'string' }, description: 'List of banned teams' },
            banned: { type: 'boolean', description: 'Ban status of the organiser' },
            visibilitySettings: {
                type: 'object',
                properties: {
                    descriptionVisible: { type: 'boolean', description: 'Visibility of the description' },
                    profilePhotoVisible: { type: 'boolean', description: 'Visibility of the profile photo' },
                    prizePoolVisible: { type: 'boolean', description: 'Visibility of the prize pool' },
                    tournamentsVisible: { type: 'boolean', description: 'Visibility of the tournaments' },
                    followersVisible: { type: 'boolean', description: 'Visibility of the followers' }
                }
            }
        }
    },
    Player: {
        type: 'object',
        required: ['username', 'email', 'password'],
        properties: {
            username: { type: 'string', unique: true, description: 'The username of the player' },
            email: { type: 'string', unique: true, description: 'The email address of the player' },
            password: { type: 'string', description: 'The password for the player\'s account' },
            profilePhoto: { type: 'object', properties: {
                data: { type: 'string', description: 'Base64-encoded image data' },
                contentType: { type: 'string', description: 'MIME type of the image' }
            }},
            team: { type: 'string', description: 'Team ID the player is part of' },
            following: { type: 'array', items: { type: 'string' }, description: 'Organisers the player is following' },
            tournaments: { 
                type: 'array', 
                items: {
                    type: 'object',
                    properties: {
                        tournament: { type: 'string', description: 'Tournament ID' },
                        won: { type: 'boolean', description: 'Win status in the tournament' }
                    }
                },
                description: 'List of tournaments the player has participated in'
            },
            banned: { type: 'boolean', description: 'Ban status of the player' },
            notifications: { type: 'array', items: {
                type: 'object',
                properties: {
                    message: { type: 'string', description: 'Notification message' },
                    read: { type: 'boolean', description: 'Read status' },
                    date: { type: 'string', format: 'date-time', description: 'Timestamp of the notification' }
                }
            }, description: 'List of notifications for the player' }
        }
    },
    Report: {
        type: 'object',
        required: ['reportedBy', 'reportType', 'reason', 'status'],
        properties: {
            reportedBy: { type: 'string', description: 'ID of the player who reported' },
            reportType: { type: 'string', enum: ['Team', 'Organiser'], description: 'Type of report' },
            reportedTeam: { type: 'string', description: 'Reported team ID', required: false },
            reportedOrganiser: { type: 'string', description: 'Reported organiser ID', required: false },
            reason: { type: 'string', description: 'Reason for the report' },
            status: { type: 'string', enum: ['Pending', 'Reviewed'], description: 'Current status of the report' }
        }
    },
    BanHistory: {
        type: 'object',
        required: ['bannedEntity', 'entityType', 'reason'],
        properties: {
            bannedEntity: { type: 'string', description: 'ID of the banned entity (Player, Team, or Organiser)' },
            entityType: { type: 'string', enum: ['Player', 'Team', 'Organiser'], description: 'Type of banned entity' },
            reason: { type: 'string', description: 'Reason for banning' },
            date: { type: 'string', format: 'date-time', description: 'Ban date' },
            active: { type: 'boolean', description: 'Whether the ban is currently active' }
        }
    },
    Team: {
        type: 'object',
        required: ['name', 'captain'],
        properties: {
            name: { type: 'string', unique: true, description: 'The name of the team' },
            logo: { type: 'string', description: 'URL of the team logo' },
            players: { type: 'array', items: { type: 'string' }, description: 'List of player IDs in the team' },
            captain: { type: 'string', description: 'ID of the team captain' },
            tournaments: { type: 'array', items: { type: 'string' }, description: 'Tournaments the team has participated in' },
            joinRequests: { type: 'array', items: { type: 'string' }, description: 'Player IDs requesting to join the team' }
        }
    },
    Tournament: {
        type: 'object',
        required: ['tid', 'name', 'startDate', 'endDate', 'organiser'],
        properties: {
            tid: { type: 'string', description: 'Tournament identifier' },
            name: { type: 'string', description: 'The name of the tournament' },
            startDate: { type: 'date', description: 'Start date of the tournament' },
            endDate: { type: 'date', description: 'End date of the tournament' },
            entryFee: { type: 'number', description: 'Entry fee for the tournament' },
            prizePool: { type: 'number', description: 'Total prize pool for the tournament' },
            status: { 
                type: 'string', 
                enum: ['Pending', 'Approved', 'Completed'], 
                description: 'Current status of the tournament' 
            },
            organiser: { type: 'string', description: 'ID of the organiser managing the tournament' },
            teams: { type: 'array', items: { type: 'string' }, description: 'Teams participating in the tournament' },
            description: { type: 'string', description: 'Description of the tournament' },
            winner: { type: 'string', description: 'ID of the winning team' },
            pointsTable: {
                type: 'array',
                items: {
                    type: 'object',
                    properties: {
                        ranking: { type: 'number', description: 'Rank in the tournament' },
                        teamName: { type: 'string', description: 'Name of the team' },
                        totalPoints: { type: 'number', description: 'Total points accumulated in the tournament' }
                    }
                },
                description: 'Points table for the tournament'
            }
        }
    }
};