
# Colosseum: E-Sports Tournament Hosting Platform

**Colosseum** is a web platform for organizing and participating in e-sports tournaments. It allows organizers to create tournaments, manage teams, and track tournament progress. Players can register, join tournaments, and view tournament results. The platform also provides administrative control for banning or approving users and tournaments, ensuring a secure and fair experience for all participants.

## Table of Contents
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Installation](#installation)
- [Configuration](#configuration)
- [Usage](#usage)
- [Project Structure](#project-structure)
- [API Endpoints](#api-endpoints)
- [License](#license)

## Features

- **Player Registration & Login**: Players can register, log in, and participate in tournaments.
- **Tournament Creation**: Organizers can create and manage tournaments.
- **Team Management**: Organize players into teams and manage team participation.
- **Real-time Updates**: View tournament progress and track results.
- **Admin Controls**: Admins can ban/unban users and approve tournaments.
- **Secure Authentication**: Uses JWT-based authentication for players and organizers.
- **Role-based Access Control**: Provides different levels of access for admins, organizers, and players.

## Tech Stack

- **Frontend**: HTML, CSS, JavaScript, [EJS](https://ejs.co/) for templating.
- **Backend**: Node.js, Express.js, MongoDB.
- **Authentication**: JWT (JSON Web Token).
- **Database**: MongoDB for storing player, team, tournament, and report data.
- **Middleware**: Custom middleware for authentication and role-based access control.

## Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/colosseum.git
   cd colosseum
   ```

2. Install the dependencies:
   ```bash
   npm install
   ```

3. Set up the environment variables. Create a `.env` file in the root directory with the following values:
   ```bash
   MONGO_URI=mongodb://localhost:27017/tournamentDB
   JWT_SECRET=your_jwt_secret_key
   ```

4. Start the server:
   ```bash
   npm start
   ```

5. Open the browser and navigate to `http://localhost:3000` to view the application.

## Configuration

To configure the environment variables, update the `.env` file as follows:

- `MONGO_URI`: MongoDB connection string.
- `JWT_SECRET`: Secret key used for signing JWT tokens.
- **Port Configuration**: The default port is `3000`. You can change it in the `app.js` file if needed.

## Usage

1. **Player Registration and Login**: Players can sign up and log in from the homepage.
2. **Organizing a Tournament**: After logging in, organizers can create new tournaments and manage them.
3. **Team Management**: Organizers can create teams, and players can join teams.
4. **Admin Controls**: Admins can ban/unban users and approve tournaments through the admin dashboard.

## Project Structure

```plaintext
backend
├── app.js                      # Main entry point of the application
├── controllers/                # Controller files handling business logic
├── middleware/                 # Authentication and role-based access middlewares
├── models/                     # Mongoose models for the database
├── routes/                     # Route handlers for different resources
└── views/                      # EJS views for the frontend
```

### Main Components

- **app.js**: Initializes the server, connects to the database, and sets up routes and middleware.
- **controllers**: Contains the logic for players, organizers, admins, and tournament handling.
- **models**: Mongoose models for `Player`, `Organiser`, `Team`, `Tournament`, etc.
- **routes**: Defines the API routes for different entities (players, organizers, tournaments, etc.).
- **views**: Contains EJS templates for rendering the frontend.

## API Endpoints

### Auth Routes

- `POST /auth/login`: Log in as a player or organizer.
- `POST /auth/register`: Register a new player.

### Player Routes

- `POST /api/player`: Create a new player.
- `GET /api/player/:id`: Get player details.

### Tournament Routes

- `POST /api/tournament`: Create a new tournament.
- `GET /api/tournament/:id`: Get tournament details.

### Admin Routes

- `POST /api/admin/banPlayer/:id`: Ban a player.
- `POST /api/admin/unbanPlayer/:id`: Unban a player.
- `POST /api/admin/approveTournament/:id`: Approve a tournament.

For a full list of API routes, see the [API documentation](./docs/API.md).

## License

This project is licensed under the MIT License. See the [LICENSE](./LICENSE) file for details.
