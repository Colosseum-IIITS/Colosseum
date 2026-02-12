# Colosseum B2B API Documentation

## Overview

This document outlines the B2B integration API endpoints provided by the Colosseum e-sports tournament platform. These APIs enable third-party applications and partners to access tournament data, player rankings, and receive real-time notifications about important events.

## Authentication

All B2B API endpoints require authentication using an API key. Partners must obtain an API key from the Colosseum administration team.

### API Key Authentication

Include your API key in all requests using the `X-API-Key` header:

```
X-API-Key: your_api_key_here
```

### API Key Permissions

API keys can have the following permissions:
- `read`: Access to read-only endpoints
- `write`: Access to write operations (e.g., webhook registration)
- `admin`: Administrative access (reserved for internal use)

## Base URL

All API endpoints are prefixed with:

```
https://api.colosseum.com/api/integration
```

## Rate Limiting

To ensure fair usage and system stability, API requests are rate-limited:
- 100 requests per minute for standard partners
- 500 requests per minute for premium partners

Exceeding these limits will result in HTTP 429 (Too Many Requests) responses.

## Endpoints

### Tournaments

#### Get Tournament Data

```
GET /tournaments
```

Retrieves tournament data for integration partners.

**Authentication Required**: Yes (API Key)

**Query Parameters**:
- `limit` (integer, optional): Maximum number of records to return (default: 50)
- `status` (string, optional): Filter by tournament status (`Pending`, `Approved`, `Completed`)

**Response**:
```json
{
  "data": [
    {
      "tid": "123",
      "name": "Summer Championship 2025",
      "startDate": "2025-06-01T00:00:00.000Z",
      "endDate": "2025-06-15T00:00:00.000Z",
      "entryFee": 50,
      "prizePool": 5000,
      "status": "Approved",
      "organiser": "60d21b4667d0d8992e610c85",
      "description": "Annual summer esports championship"
    }
  ]
}
```

### Webhooks

#### Register a Webhook

```
POST /webhooks
```

Registers a webhook for receiving event notifications.

**Authentication Required**: Yes (API Key)

**Request Body**:
```json
{
  "url": "https://partner-domain.com/webhook/endpoint",
  "events": ["tournament.created", "tournament.completed"]
}
```

**Available Events**:
- `tournament.created`: Triggered when a new tournament is created
- `tournament.updated`: Triggered when tournament details are updated
- `tournament.completed`: Triggered when a tournament is completed
- `team.joined`: Triggered when a team joins a tournament

**Response**:
```json
{
  "id": "webhook_1620144853123",
  "url": "https://partner-domain.com/webhook/endpoint",
  "events": ["tournament.created", "tournament.completed"]
}
```

### Leaderboard

#### Get Global Player Leaderboard

```
GET /leaderboard
```

Retrieves global player ranking data.

**Authentication Required**: Yes (API Key)

**Query Parameters**:
- `game` (string, optional): Filter by game type
- `limit` (integer, optional): Maximum number of records to return (default: 100)

**Response**:
```json
{
  "data": [
    {
      "playerName": "GamingLegend",
      "playerId": "60d21b4667d0d8992e610c85",
      "rank": 1,
      "score": 1250,
      "tournamentsWon": 12
    },
    {
      "playerName": "ProGamer123",
      "playerId": "60d21b4667d0d8992e610c86",
      "rank": 2,
      "score": 1100,
      "tournamentsWon": 10
    }
  ]
}
```

### Teams

#### Get Team Details

```
GET /teams/details
```

Retrieves detailed information about a specific team.

**Authentication Required**: Yes (API Key)

**Query Parameters**:
- `teamId` (string, required): Team ID to get details for

**Response**:
```json
{
  "id": "60d21b4667d0d8992e610c85",
  "name": "Phoenix Blaze",
  "logo": "https://colosseum.com/logos/phoenix-blaze.png",
  "players": [
    {
      "id": "60d21b4667d0d8992e610c86",
      "username": "FireFighter"
    },
    {
      "id": "60d21b4667d0d8992e610c87",
      "username": "IceBreaker"
    }
  ],
  "captain": {
    "id": "60d21b4667d0d8992e610c86",
    "username": "FireFighter"
  },
  "tournaments": ["60d21b4667d0d8992e610c88", "60d21b4667d0d8992e610c89"]
}
```

## Webhook Payload Format

When an event is triggered, Colosseum will send a POST request to the registered webhook URL with the following payload structure:

```json
{
  "event": "tournament.created",
  "timestamp": "2025-05-01T12:34:56.789Z",
  "data": {
    // Event-specific data
  }
}
```

### Event-Specific Data

#### tournament.created / tournament.updated

```json
{
  "event": "tournament.created",
  "timestamp": "2025-05-01T12:34:56.789Z",
  "data": {
    "tid": "123",
    "name": "Summer Championship 2025",
    "startDate": "2025-06-01T00:00:00.000Z",
    "endDate": "2025-06-15T00:00:00.000Z",
    "entryFee": 50,
    "prizePool": 5000,
    "status": "Approved",
    "organiser": "60d21b4667d0d8992e610c85"
  }
}
```

#### tournament.completed

```json
{
  "event": "tournament.completed",
  "timestamp": "2025-06-15T18:30:00.000Z",
  "data": {
    "tid": "123",
    "name": "Summer Championship 2025",
    "winner": {
      "teamId": "60d21b4667d0d8992e610c90",
      "teamName": "Phoenix Blaze"
    },
    "pointsTable": [
      {
        "ranking": 1,
        "teamName": "Phoenix Blaze",
        "totalPoints": 250
      },
      {
        "ranking": 2,
        "teamName": "Dragon Warriors",
        "totalPoints": 200
      }
    ]
  }
}
```

#### team.joined

```json
{
  "event": "team.joined",
  "timestamp": "2025-05-15T14:20:30.000Z",
  "data": {
    "tournamentId": "123",
    "tournamentName": "Summer Championship 2025",
    "teamId": "60d21b4667d0d8992e610c90",
    "teamName": "Phoenix Blaze"
  }
}
```

## Error Handling

All API endpoints return standard HTTP status codes:

- `200 OK`: Request successful
- `201 Created`: Resource was successfully created
- `400 Bad Request`: Invalid request parameters
- `401 Unauthorized`: Invalid or missing API key
- `404 Not Found`: Resource not found
- `429 Too Many Requests`: Rate limit exceeded
- `500 Internal Server Error`: Server error

Error responses include a JSON object with an error message:

```json
{
  "message": "Error message details"
}
```

## CORS Policy

Our API supports Cross-Origin Resource Sharing (CORS) for integration with web applications. The following headers are included in all responses:

```
Access-Control-Allow-Origin: *
Access-Control-Allow-Methods: GET, POST, OPTIONS
Access-Control-Allow-Headers: Content-Type, X-API-Key
```

## Support

For API support, please contact api-support@colosseum.com or visit our developer portal at https://developers.colosseum.com.
