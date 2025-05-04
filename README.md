
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
- **Pub-Sub Notification System**: Automated notifications when organizers create tournaments or other significant events occur.
- **Redis Caching**: High-performance data caching and strategic cache invalidation for optimized performance.
- **Email Notifications**: Automated email sending for account confirmations and important updates.
- **Stripe Payment Integration**: Secure payment processing for tournament entries and team creation.
- **Social Features**: Follow/unfollow system for players to keep track of preferred organizers.
- **Global Player Ranking**: Performance-based ranking system for competitive players.
- **Advanced UI Animations**: GSAP animations with ScrollTrigger for immersive user experiences.
- **Hybrid Rendering**: Leveraging both server-side and client-side rendering for optimal performance.
- **Frontend RBAC**: Role-based access control implemented directly in Next.js middleware.

## Tech Stack

- **Frontend**: [Next.js](https://nextjs.org/) with React, [Tailwind CSS](https://tailwindcss.com/) for styling, [shadcn UI](https://ui.shadcn.com/) components, GSAP for animations.
- **Backend**: Node.js, Express.js, MongoDB, Swagger for API documentation.
- **Authentication**: JWT (JSON Web Token).
- **Database**: MongoDB for storing player, team, tournament, and report data.
- **Caching**: Redis for high-performance data caching and reduced database load.
- **Payment Processing**: Stripe API integration for secure payment handling.
- **Email Service**: Nodemailer for automated email notifications.
- **Middleware**: Custom middleware for authentication and role-based access control.
- **Testing**: Jest with MongoDB Memory Server for isolated unit and integration testing.

## Advanced Technical Implementation

### Frontend Architecture

#### Server and Client Components
Colosseum utilizes Next.js App Router with a hybrid rendering approach:
- **Server Components**: Used for data-fetching operations and initial page loads
- **Client Components**: Used for interactive elements with the 'use client' directive
- **Dynamic Rendering**: Strategic mix of static and dynamic rendering for optimal performance

#### Role-Based Access Control (RBAC)
Implemented at the middleware level for secure access control:
- JWT token verification at the edge using Jose library
- Route protection based on user roles (admin, organizer, player)
- Path-specific access rules with granular permissions
- Automatic redirection for unauthorized access attempts

#### Advanced Animations
Leverage GSAP (GreenSock Animation Platform) for professional animations:
- ScrollTrigger for scroll-based animations and effects
- Complex timeline animations for hero sections
- Canvas-based cursor effects and interactive elements
- Performant video transitions and transformations

### Notification System
Colosseum implements a pub-sub notification system that automatically notifies players of relevant events:
- Automatically notifies followers when an organizer creates a new tournament
- Uses MongoDB push operations to efficiently deliver notifications
- Notification history is stored in player profiles

### Redis Caching Strategy
The application uses strategic caching to optimize performance:
- Player profiles, tournament listings, and global rankings are cached
- Intelligent cache invalidation on data updates (e.g., tournament winners, profile updates)
- Fallback mechanisms when cache is unavailable

### Payment Processing
Secure payment handling using Stripe:
- Two-step payment process with intent creation and confirmation
- Metadata tracking for payment attribution
- Database records for payment verification and history

### Testing Infrastructure
Robust testing setup for reliable code quality:
- In-memory MongoDB instance for isolated tests
- Mock Redis implementation for cache testing
- Controller and route integration testing

### Frontend State Management
Sophisticated state management architecture:
- React Context API with custom providers for global state
- Custom hooks for reusable logic and data fetching
- Optimistic UI updates for responsive user experience
- Strategic client-side caching for repeated data

## Installation

### Standard Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/colosseum.git
   cd colosseum
   ```

2. Install the dependencies for backend and frontend:
   ```bash
   # Install backend dependencies
   cd backend
   npm install
   cd ..
   
   # Install frontend dependencies
   cd frontend
   npm install
   cd ..
   
   # Install landing page dependencies
   cd LandingPage
   npm install
   cd ..
   ```

3. Set up the environment variables. Create a `.env` file in the backend directory with the following values:
   ```bash
   MONGODB_URI=mongodb://localhost:27017/tournamentDB
   JWT_SECRET_KEY=your_jwt_secret_key
   PORT=5000
   REDIS_URL=redis://localhost:6379
   EMAIL_USER=your_email@gmail.com
   EMAIL_PASS=your_email_app_password
   STRIPE_SECRET_KEY=your_stripe_secret_key
   ```

4. Start the backend server:
   ```bash
   cd backend
   npm start
   ```

5. In a separate terminal, start the frontend development server:
   ```bash
   cd frontend
   npm run dev
   ```

6. Open the browser and navigate to `http://localhost:3000` to view the application. The backend API will be running on `http://localhost:5000` with Swagger documentation at the root path.

### Docker Installation

You can run the entire application stack using Docker Compose, which will set up all services (frontend, backend, landing page, MongoDB, and Redis) in isolated containers:

#### Prerequisites
- Docker and Docker Compose installed on your machine
- Git repository cloned to your local machine

#### Setup and Installation

1. Create a `.env` file at the root of the project by copying the provided `.env.example` file:
   ```bash
   cp .env.example .env
   ```

2. Edit the `.env` file to add your specific configurations (see Environment Variables section above)

3. Build and start the Docker containers:
   ```bash
   # Clean up any existing containers first (optional but recommended)
   docker-compose down -v
   docker system prune -a --volumes --force
   
   # Build fresh containers
   docker-compose build --no-cache
   
   # Start the containers
   docker-compose up
   ```

4. Access the application components:
   - Landing Page: `http://localhost:4000`
   - Main Application: `http://localhost:3000`
   - Backend API: `http://localhost:5000`
   - MongoDB: `mongodb://localhost:27017`
   - Redis: `redis://localhost:6379`

#### Docker Commands Reference

- Start the containers in the background:
  ```bash
  docker-compose up -d
  ```

- Stop the containers:
  ```bash
  docker-compose down
  ```

- View logs from all containers:
  ```bash
  docker-compose logs -f
  ```

- View logs from a specific service:
  ```bash
  docker-compose logs -f [service_name]
  ```
  Where `[service_name]` can be: backend, frontend, landingpage, mongodb, or redis

- Rebuild a specific service:
  ```bash
  docker-compose build --no-cache [service_name]
  ```

#### Troubleshooting Docker Deployment

1. **Native Module Build Issues**
   If you encounter errors related to bcrypt or other native modules:
   - The Dockerfile includes necessary build dependencies (python3, make, g++, gcc)
   - If still encountering issues, you may need to modify the Dockerfile to include additional dependencies

2. **JWT Authentication Issues**
   - Ensure JWT_SECRET_KEY is the same in both frontend and backend services
   - For authentication debugging, check the logs using `docker-compose logs -f frontend`

3. **Database Connection Issues**
   - Check MongoDB connection with `docker-compose exec mongodb mongo -u admin -p password`
   - Ensure the MONGODB_URI in .env uses the correct service name: `mongodb://admin:password@mongodb:27017/tournamentDB?authSource=admin`

4. **Network/API Connection Issues**
   - Frontend to backend communication uses the environment variable NEXT_PUBLIC_API_URL
   - In the container environment, ensure this is set correctly in docker-compose.yml

5. **Redis Connection Issues**
   - Test Redis connection with `docker-compose exec redis redis-cli -a redispassword ping`
   - Ensure REDIS_URL uses the correct service name: `redis://:redispassword@redis:6379`

## Configuration

To configure the environment variables, update the `.env` file as follows:

### Environment Variables

The application requires several environment variables to function properly. For Docker deployment, these should be set in the root `.env` file, which will be read by docker-compose:

```
# JWT Authentication
JWT_SECRET_KEY=projectK         # Used by both frontend and backend for RBAC

# MongoDB
MONGODB_URI=mongodb://admin:password@mongodb:27017/tournamentDB?authSource=admin

# API Configuration
PORT=5000

# Redis Cache
REDIS_URL=redis://:redispassword@redis:6379

# Email Configuration (required for verification emails)
EMAIL_USER=your_email@example.com
EMAIL_PASS=your_email_app_password

# Payment Processing
STRIPE_SECRET_KEY=your_stripe_secret_key
```

#### Important Notes for Docker Deployment:

- The `JWT_SECRET_KEY` must be the same for both frontend and backend services
- The MongoDB URI format in Docker should use the service name `mongodb` (not localhost)
- Similarly, Redis URL should use the service name `redis` (not localhost)
- Email and Stripe credentials are required for full functionality

### Development Environment Variables

For local development, you'll need separate `.env` files:

#### Backend (.env file in backend directory):
- `MONGODB_URI`: MongoDB connection string (typically to localhost or Atlas)
- `JWT_SECRET_KEY`: Secret key used for signing JWT tokens
- `PORT`: The backend server port (default: 5000)
- `REDIS_URL`: Connection string for Redis cache
- `EMAIL_USER` and `EMAIL_PASS`: For sending notifications
- `STRIPE_SECRET_KEY`: For payment processing

### Frontend:
The frontend uses Next.js and runs on port 3000 by default. Configuration for Next.js can be adjusted in the `next.config.mjs` file.

## Usage

1. **Player Registration and Login**: Players can sign up and log in through the authentication pages.
2. **Organizing a Tournament**: Organizers can create, manage, and monitor tournaments through their dedicated dashboard.
3. **Team Management**: Organizers can create teams, and players can join teams to participate in tournaments.
4. **Admin Controls**: Admins have a dedicated dashboard to manage users, approve tournaments, and oversee platform activities.
5. **Payment Processing**: The platform supports payment processing for tournament entries and other features.

## Project Structure

```plaintext
├── backend
│   ├── app.js              // Server initialization
│   ├── controllers         // Controller files for backend logic
│   │   └── __tests__       // Controller tests
│   ├── middleware          // Authentication middleware
│   ├── models              // MongoDB schema definitions
│   ├── routes              // API route handlers
│   ├── swaggerDocs         // API documentation
│   ├── test                // Test setup and mocks
│   └── utils               // Utility functions
├── frontend
│   ├── app                 // Next.js app directory (app router)
│   │   ├── admin           // Admin dashboard pages
│   │   ├── auth            // Authentication pages
│   │   ├── org             // Organizer pages
│   │   ├── player          // Player pages
│   │   └── payment         // Payment processing pages
│   ├── components          // Reusable React components
│   │   ├── org             // Organizer components
│   │   ├── player          // Player components
│   │   ├── payment         // Payment components
│   │   └── ui              // UI components (shadcn)
│   ├── context             // React context providers
│   ├── hooks               // Custom React hooks
│   ├── lib                 // Utility libraries
│   ├── public              // Static files
│   └── utils               // Utility functions
```

### Main Components

#### Backend:
- **app.js**: Initializes the Express server, connects to MongoDB, and sets up routes and middleware.
- **controllers**: Contains the business logic for players, organizers, admins, tournaments, and other entities.
- **middleware**: Authentication and authorization logic for different user roles.
- **models**: Mongoose models defining the data schema for `Player`, `Organiser`, `Team`, `Tournament`, etc.
- **routes**: API endpoint definitions for all entities.
- **swaggerDocs**: API documentation using Swagger UI.
- **utils**: Helper functions including database utilities.

#### Frontend:
- **app/**: Next.js app directory using the App Router for page routing.
- **components/**: Reusable React components organized by feature area.
- **context/**: React context providers for state management.
- **hooks/**: Custom React hooks for shared functionality.
- **lib/**: Utility libraries and configurations.
- **public/**: Static assets including images and videos.
- **utils/**: Helper functions for the frontend.

## ERD(Entity Relationship Diagram):
![alt text](image.png)

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
