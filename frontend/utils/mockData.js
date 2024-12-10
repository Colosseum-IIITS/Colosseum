
export const mockPlayers = [
  { id: "1", username: "player1", email: "player1@example.com", banned: false },
  { id: "2", username: "player2", email: "player2@example.com", banned: true },
  { id: "3", username: "player3", email: "player3@example.com", banned: false },
  { id: "4", username: "player4", email: "player4@example.com", banned: true },
  { id: "5", username: "player5", email: "player5@example.com", banned: false },
  { id: "6", username: "player6", email: "player6@example.com", banned: true },
  { id: "7", username: "player7", email: "player7@example.com", banned: false },
  { id: "8", username: "player8", email: "player8@example.com", banned: true },
  { id: "9", username: "player9", email: "player9@example.com", banned: false },
  {
    id: "10",
    username: "player10",
    email: "player10@example.com",
    banned: true
  }
]

export const mockOrganizers = [
  {
    id: "1",
    username: "organizer1",
    email: "organizer1@example.com",
    banned: false
  },
  {
    id: "2",
    username: "organizer2",
    email: "organizer2@example.com",
    banned: true
  },
  {
    id: "3",
    username: "organizer3",
    email: "organizer3@example.com",
    banned: false
  },
  {
    id: "4",
    username: "organizer4",
    email: "organizer4@example.com",
    banned: true
  },
  {
    id: "5",
    username: "organizer5",
    email: "organizer5@example.com",
    banned: false
  },
  {
    id: "6",
    username: "organizer6",
    email: "organizer6@example.com",
    banned: true
  },
  {
    id: "7",
    username: "organizer7",
    email: "organizer7@example.com",
    banned: false
  },
  {
    id: "8",
    username: "organizer8",
    email: "organizer8@example.com",
    banned: true
  },
  {
    id: "9",
    username: "organizer9",
    email: "organizer9@example.com",
    banned: false
  },
  {
    id: "10",
    username: "organizer10",
    email: "organizer10@example.com",
    banned: true
  }
]

export const mockBanHistory = [
  {
    id: "1",
    username: "player1",
    type: "Player",
    reason: "Cheating",
    date: new Date("2023-01-01"),
    active: false
  },
  {
    id: "2",
    username: "organizer1",
    type: "Organizer",
    reason: "Fraud",
    date: new Date("2023-02-01"),
    active: true
  },
  {
    id: "3",
    username: "player2",
    type: "Player",
    reason: "Toxic Behavior",
    date: new Date("2023-03-01"),
    active: true
  },
  {
    id: "4",
    username: "organizer2",
    type: "Organizer",
    reason: "Unfair Practices",
    date: new Date("2023-04-01"),
    active: false
  },
  {
    id: "5",
    username: "player3",
    type: "Player",
    reason: "Exploiting Glitches",
    date: new Date("2023-05-01"),
    active: true
  },
  {
    id: "6",
    username: "organizer3",
    type: "Organizer",
    reason: "Harassment",
    date: new Date("2023-06-01"),
    active: false
  },
  {
    id: "7",
    username: "player4",
    type: "Player",
    reason: "Match Fixing",
    date: new Date("2023-07-01"),
    active: true
  },
  {
    id: "8",
    username: "organizer4",
    type: "Organizer",
    reason: "Fraudulent Activities",
    date: new Date("2023-08-01"),
    active: false
  },
  {
    id: "9",
    username: "player5",
    type: "Player",
    reason: "Team Killing",
    date: new Date("2023-09-01"),
    active: true
  },
  {
    id: "10",
    username: "organizer5",
    type: "Organizer",
    reason: "Inconsistent Scheduling",
    date: new Date("2023-10-01"),
    active: false
  }
]

export const mockTeamReports = [
  {
    id: "1",
    teamName: "Team A",
    reportedBy: "player2",
    reason: "Unsportsmanlike conduct",
    status: "Pending"
  },
  {
    id: "2",
    teamName: "Team B",
    reportedBy: "player3",
    reason: "Cheating",
    status: "Reviewed"
  },
  {
    id: "3",
    teamName: "Team C",
    reportedBy: "player1",
    reason: "Toxicity",
    status: "Pending"
  },
  {
    id: "4",
    teamName: "Team D",
    reportedBy: "player4",
    reason: "Lag Switching",
    status: "Reviewed"
  },
  {
    id: "5",
    teamName: "Team E",
    reportedBy: "player5",
    reason: "Collusion",
    status: "Pending"
  },
  {
    id: "6",
    teamName: "Team F",
    reportedBy: "player6",
    reason: "Exploiting Bugs",
    status: "Reviewed"
  },
  {
    id: "7",
    teamName: "Team G",
    reportedBy: "player7",
    reason: "Team Killing",
    status: "Pending"
  },
  {
    id: "8",
    teamName: "Team H",
    reportedBy: "player8",
    reason: "Unsportsmanlike conduct",
    status: "Reviewed"
  },
  {
    id: "9",
    teamName: "Team I",
    reportedBy: "player9",
    reason: "Racial Slurs",
    status: "Pending"
  },
  {
    id: "10",
    teamName: "Team J",
    reportedBy: "player10",
    reason: "Cheating",
    status: "Reviewed"
  }
]

export const mockOrganizerReports = [
  {
    id: "1",
    organizerName: "organizer1",
    reportedBy: "player1",
    reason: "Unfair tournament rules",
    status: "Pending"
  },
  {
    id: "2",
    organizerName: "organizer2",
    reportedBy: "player2",
    reason: "Delayed payments",
    status: "Reviewed"
  },
  {
    id: "3",
    organizerName: "organizer3",
    reportedBy: "player3",
    reason: "Poor communication",
    status: "Pending"
  },
  {
    id: "4",
    organizerName: "organizer4",
    reportedBy: "player4",
    reason: "Discriminatory behavior",
    status: "Reviewed"
  },
  {
    id: "5",
    organizerName: "organizer5",
    reportedBy: "player5",
    reason: "Fraudulent activities",
    status: "Pending"
  },
  {
    id: "6",
    organizerName: "organizer6",
    reportedBy: "player6",
    reason: "Unfair practices",
    status: "Reviewed"
  },
  {
    id: "7",
    organizerName: "organizer7",
    reportedBy: "player7",
    reason: "Tournament delays",
    status: "Pending"
  },
  {
    id: "8",
    organizerName: "organizer8",
    reportedBy: "player8",
    reason: "Cheating",
    status: "Reviewed"
  },
  {
    id: "9",
    organizerName: "organizer9",
    reportedBy: "player9",
    reason: "Unprofessionalism",
    status: "Pending"
  },
  {
    id: "10",
    organizerName: "organizer10",
    reportedBy: "player10",
    reason: "Inconsistent schedules",
    status: "Reviewed"
  }
]

export const searchPlayers = async query => {
  return mockPlayers.filter(
    player =>
      player.username.toLowerCase().includes(query.toLowerCase()) ||
      player.email.toLowerCase().includes(query.toLowerCase())
  )
}

export const searchOrganizers = async query => {
  return mockOrganizers.filter(
    organizer =>
      organizer.username.toLowerCase().includes(query.toLowerCase()) ||
      organizer.email.toLowerCase().includes(query.toLowerCase())
  )
}

export const toggleBanPlayer = async playerId => {
  console.log(`Toggling ban for player with ID: ${playerId}`)
}

export const toggleBanOrganizer = async organizerId => {
  console.log(`Toggling ban for organizer with ID: ${organizerId}`)
}

export const revertBan = async banId => {
  console.log(`Reverting ban with ID: ${banId}`)
}
