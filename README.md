
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
├── backend
│   ├── app.js              //Server      
│   ├── controllers         //Controller Files To Handle Backend Logic
│   ├── middleware          //Middleware Functions To Handle Authentication
│   ├── models              //Database Schema
│   └── routes              //Handles Routing Logic
├── frontend
│   ├── assets              //Contains Front-End Assets         
│   └── views               //Contains Views to be rendered

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
#SNAPSHOTS TO DESCRIBE THE FLOW OF APPLICATION
![Screenshot from 2024-09-27 05-37-50](https://github.com/user-attachments/assets/58a2342f-27bb-48ae-bdd9-d59c9e6422d1)

![Screenshot from 2024-09-27 05-37-59](https://github.com/user-attachments/assets/f3cd7faf-7576-4046-b92e-fbe1cfdd2f58)

![Screenshot from 2024-09-27 05-38-42](https://github.com/user-attachments/assets/23f1e840-bd77-494a-81a7-9c36b8949fe3)

![Screenshot from 2024-09-27 05-38-56](https://github.com/user-attachments/assets/31d34cd3-0342-4e1c-a415-09cf198b0198)

![Screenshot from 2024-09-27 05-39-07](https://github.com/user-attachments/assets/bd8814dd-4636-4718-9569-c5a849ba0553)

![Screenshot from 2024-09-27 05-40-45](https://github.com/user-attachments/assets/cfbff034-71d5-4f01-aeeb-2f2ebb27f4fd)

![Screenshot from 2024-09-27 05-41-19](https://github.com/user-attachments/assets/1734e50c-ba03-4565-ae74-e91babc25484)

![Screenshot from 2024-09-27 05-57-34](https://github.com/user-attachments/assets/50b083ff-2cf4-41af-804a-117859d0d295)

![Screenshot from 2024-09-27 05-57-51](https://github.com/user-attachments/assets/18f09d13-323f-44d3-9de1-7b4e17a27ebf)

![Screenshot from 2024-09-27 05-58-01](https://github.com/user-attachments/assets/bc3cd9f1-3118-4840-91cc-6d41ce822206)

![Screenshot from 2024-09-27 05-58-06](https://github.com/user-attachments/assets/235c18b5-f663-4686-9596-0f24d5f83e31)

![Screenshot from 2024-09-27 05-59-19](https://github.com/user-attachments/assets/834b57ca-f8ba-4098-9f59-1699f8870693)

![Screenshot from 2024-09-27 05-59-19](https://github.com/user-attachments/assets/e615da7c-4143-4965-bca8-bb80145956ab)

![Screenshot from 2024-09-27 06-00-04](https://github.com/user-attachments/assets/80ef2866-679e-4fce-995c-6c6a5b63290a)

![Screenshot from 2024-09-27 06-00-14](https://github.com/user-attachments/assets/fb318760-eb8e-42dc-b502-7c1e8558eca3)

![Screenshot from 2024-09-27 06-00-31](https://github.com/user-attachments/assets/17406379-7381-4be0-acca-139fb7473cab)

![Screenshot from 2024-09-27 06-00-43](https://github.com/user-attachments/assets/dd7afd8e-dd2f-4251-94c0-d7ec13363456)

![Screenshot from 2024-09-27 06-01-01](https://github.com/user-attachments/assets/a559f9f6-afa2-4b53-8ff0-f72984eafa29)

![Screenshot from 2024-09-27 06-01-28](https://github.com/user-attachments/assets/8be0313b-98fc-4690-a633-0384a99cf15f)

![Screenshot from 2024-09-27 06-01-33](https://github.com/user-attachments/assets/8211b3f5-45e8-45a3-b263-4b0fb71f38a9)

![Screenshot from 2024-09-27 06-01-45](https://github.com/user-attachments/assets/c431040d-15f6-4c44-927b-131d1a650f8c)

![Screenshot from 2024-09-27 06-02-00](https://github.com/user-attachments/assets/004d5524-d399-4e62-aaa0-89f0090ae565)

![Screenshot from 2024-09-27 06-02-10](https://github.com/user-attachments/assets/f8bac5d3-2204-4c95-9176-988c3f27973d)

![Screenshot from 2024-09-27 06-02-10](https://github.com/user-attachments/assets/ddb592c4-cee0-4b05-9711-4b7b0f644ed5)

![Screenshot from 2024-09-27 06-02-10](https://github.com/user-attachments/assets/f7592a89-df9d-46fb-90ee-22176a1929c0)

![Screenshot from 2024-09-27 06-03-16](https://github.com/user-attachments/assets/2d01178d-8a7e-4800-b183-8264016381b1)

![Screenshot from 2024-09-27 06-03-20](https://github.com/user-attachments/assets/d0e58889-de1d-4fcb-98e3-f483c2fb66a4)

![Screenshot from 2024-09-27 06-03-36](https://github.com/user-attachments/assets/6d6a89a5-a785-4e91-8757-656d877eb5b5)

![Screenshot from 2024-09-27 06-03-36](https://github.com/user-attachments/assets/43d1b50a-5e91-429e-82df-0fa009e71ec7)

## License

This project is licensed under the MIT License. See the [LICENSE](./LICENSE) file for details.
