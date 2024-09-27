
# API Documentation for Admin Routes

## Base URL
 ```bash
    /admin
```
## Authentication
All routes require admin authentication using the `authenticateAdmin` middleware. Ensure that a valid admin token is included in the request headers.

### Endpoints

### 1. Get Dashboard
- **URL**: `/dashboard`
- **Method**: `GET`
- **Authentication**: Required
- **Description**: Retrieves the admin dashboard.
- **Response**:
  - **200 OK**: Returns the dashboard data.
  - **401 Unauthorized**: If the admin is not authenticated.

### 2. Ban Organiser
- **URL**: `/ban/organiser/:id`
- **Method**: `POST`
- **Authentication**: Required
- **Description**: Bans an organiser by their ID.
- **Path Parameters**:
  - `id` (string): The ID of the organiser to be banned.
- **Request Body**: No body required.
- **Response**:
  - **200 OK**: Returns a message indicating the organiser has been banned.
  - **400 Bad Request**: If there is an error with the request.

### 3. Unban Organiser
- **URL**: `/unban/organiser/:id`
- **Method**: `POST`
- **Authentication**: Required
- **Description**: Unbans an organiser by their ID.
- **Path Parameters**:
  - `id` (string): The ID of the organiser to be unbanned.
- **Request Body**: No body required.
- **Response**:
  - **200 OK**: Returns a message indicating the organiser has been unbanned.
  - **400 Bad Request**: If there is an error with the request.

### 4. Delete Organiser
- **URL**: `/delete/organiser/:id`
- **Method**: `POST`
- **Authentication**: Required
- **Description**: Deletes an organiser by their ID.
- **Path Parameters**:
  - `id` (string): The ID of the organiser to be deleted.
- **Request Body**: No body required.
- **Response**:
  - **200 OK**: Returns a message indicating the organiser has been deleted.
  - **400 Bad Request**: If there is an error with the request.

### 5. Delete Tournament
- **URL**: `/delete/:tournamentId`
- **Method**: `POST`
- **Authentication**: Required
- **Description**: Deletes a tournament by its ID.
- **Path Parameters**:
  - `tournamentId` (string): The ID of the tournament to be deleted.
- **Request Body**: No body required.
- **Response**:
  - **200 OK**: Returns a message indicating the tournament has been deleted.
  - **400 Bad Request**: If there is an error with the request.

### 6. Ban Player
- **URL**: `/ban/player/:id`
- **Method**: `POST`
- **Authentication**: Required
- **Description**: Bans a player by their ID.
- **Path Parameters**:
  - `id` (string): The ID of the player to be banned.
- **Request Body**: No body required.
- **Response**:
  - **200 OK**: Returns a message indicating the player has been banned.
  - **400 Bad Request**: If there is an error with the request.

### 7. Unban Player
- **URL**: `/unban/player/:id`
- **Method**: `POST`
- **Authentication**: Required
- **Description**: Unbans a player by their ID.
- **Path Parameters**:
  - `id` (string): The ID of the player to be unbanned.
- **Request Body**: No body required.
- **Response**:
  - **200 OK**: Returns a message indicating the player has been unbanned.
  - **400 Bad Request**: If there is an error with the request.

### 8. Delete Player
- **URL**: `/delete/player/:id`
- **Method**: `POST`
- **Authentication**: Required
- **Description**: Deletes a player by their ID.
- **Path Parameters**:
  - `id` (string): The ID of the player to be deleted.
- **Request Body**: No body required.
- **Response**:
  - **200 OK**: Returns a message indicating the player has been deleted.
  - **400 Bad Request**: If there is an error with the request.

### 9. Approve Tournament
- **URL**: `/approve/tournament/:id`
- **Method**: `POST`
- **Authentication**: Required
- **Description**: Approves a tournament by its ID.
- **Path Parameters**:
  - `id` (string): The ID of the tournament to be approved.
- **Request Body**: No body required.
- **Response**:
  - **200 OK**: Returns a message indicating the tournament has been approved.
  - **400 Bad Request**: If there is an error with the request.

# API Documentation for Authentication Routes

## Base URL
```bash
    /auth
```
## Endpoints

### Player Authentication

#### 1. Player Sign In
- **URL**: `/player/signin`
- **Method**: `POST`
- **Request Body**:
    ```json
    {
        "email": "string",
        "password": "string"
    }
    ```
- **Responses**:
    - **200 OK**: Successfully logged in.
        ```json
        {
            "token": "string",
            "user": {
                "id": "string",
                "username": "string",
                "email": "string"
            }
        }
        ```
    - **400 Bad Request**: Invalid credentials or missing fields.
        ```json
        {
            "message": "Invalid email or password"
        }
        ```

#### 2. Player Sign Up
- **URL**: `/player/signup`
- **Method**: `POST`
- **Request Body**:
    ```json
    {
        "username": "string",
        "email": "string",
        "password": "string"
    }
    ```
- **Responses**:
    - **201 Created**: Player successfully registered.
        ```json
        {
            "message": "Player registered successfully",
            "user": {
                "id": "string",
                "username": "string",
                "email": "string"
            }
        }
        ```
    - **400 Bad Request**: Missing fields or email/username already exists.
        ```json
        {
            "message": "Email or username already exists"
        }
        ```

### Organiser Authentication

#### 3. Organiser Sign In
- **URL**: `/org/signin`
- **Method**: `POST`
- **Request Body**:
    ```json
    {
        "email": "string",
        "password": "string"
    }
    ```
- **Responses**:
    - **200 OK**: Successfully logged in.
        ```json
        {
            "token": "string",
            "user": {
                "id": "string",
                "username": "string",
                "email": "string"
            }
        }
        ```
    - **400 Bad Request**: Invalid credentials or missing fields.
        ```json
        {
            "message": "Invalid email or password"
        }
        ```

#### 4. Organiser Sign Up
- **URL**: `/org/signup`
- **Method**: `POST`
- **Request Body**:
    ```json
    {
        "username": "string",
        "email": "string",
        "password": "string"
    }
    ```
- **Responses**:
    - **201 Created**: Organiser successfully registered.
        ```json
        {
            "message": "Organiser registered successfully",
            "user": {
                "id": "string",
                "username": "string",
                "email": "string"
            }
        }
        ```
    - **400 Bad Request**: Missing fields or email/username already exists.
        ```json
        {
            "message": "Email or username already exists"
        }
        ```

### Admin Authentication

#### 5. Create Admin
- **URL**: `/admin/create`
- **Method**: `POST`
- **Request Body**:
    ```json
    {
        "username": "string",
        "email": "string",
        "password": "string"
    }
    ```
- **Responses**:
    - **201 Created**: Admin successfully created.
        ```json
        {
            "message": "Admin created successfully",
            "user": {
                "id": "string",
                "username": "string",
                "email": "string"
            }
        }
        ```
    - **400 Bad Request**: Missing fields or email already exists.
        ```json
        {
            "message": "Email already exists"
        }
        ```

#### 6. Admin Login
- **URL**: `/admin/login`
- **Method**: `POST`
- **Request Body**:
    ```json
    {
        "email": "string",
        "password": "string"
    }
    ```
- **Responses**:
    - **200 OK**: Successfully logged in.
        ```json
        {
            "token": "string",
            "user": {
                "id": "string",
                "username": "string",
                "email": "string"
            }
        }
        ```
    - **400 Bad Request**: Invalid credentials or missing fields.
        ```json
        {
            "message": "Invalid email or password"
        }
        ```
# Organiser API Documentation

## Overview
This document provides the details of the API endpoints available for managing organisers in the system.

## Base URL`

/api/organiser


 `## Endpoints

### 1. Search Organiser
- **GET** `/search`
- **Description**: Search for an organiser by username.
- **Authentication**: Required
- **Parameters**:
 - `username` (query parameter) - The username of the organiser to search for.

### 2. Update Organiser Username
- **POST** `/updateUsername`
- **Description**: Update the username of the authenticated organiser.
- **Authentication**: Required
- **Request Body**:
  ```json
  {
    "newUsername": "string"
  }`

### 3\. Update Organiser Email

-   **POST** `/updateEmail`
-   **Description**: Update the email of the authenticated organiser.
-   **Authentication**: Required
-   **Request Body**:

    `{
      "newEmail": "string"
    }`

### 4\. Update Organiser Password

-   **POST** `/updatePassword`
-   **Description**: Update the password of the authenticated organiser.
-   **Authentication**: Required
-   **Request Body**:

    `{
      "currentPassword": "string",
      "newPassword": "string"
    }`

### 5\. Update Organiser Description

-   **POST** `/updateDescription`
-   **Description**: Update the description of the authenticated organiser.
-   **Authentication**: Required
-   **Request Body**:

    `{
      "description": "string"
    }`

### 6\. Update Organiser Profile Photo

-   **POST** `/updateProfilePhoto`
-   **Description**: Update the profile photo of the authenticated organiser.
-   **Authentication**: Required
-   **Request Body**:

    `{
      "profilePhoto": "string" // URL or path to the new profile photo
    }`

### 7\. Get Organiser Update Profile Page

-   **GET** `/UpdateProfile`
-   **Description**: Render the update profile page for the authenticated organiser.
-   **Authentication**: Required

### 8\. Update Organiser Dashboard Visibility Settings

-   **GET** `/update-visibility`
-   **Description**: Render the visibility settings for the organiser's dashboard.
-   **Authentication**: Required

### 9\. Delete Tournament

-   **POST** `/delete/:tournamentId`
-   **Description**: Delete a tournament by ID.
-   **Authentication**: Required
-   **Parameters**:
    -   `tournamentId` (path parameter) - The ID of the tournament to delete.

### 10\. Get Organiser Dashboard

-   **GET** `/:username/dashboard`
-   **Description**: Retrieve the dashboard for the organiser with the specified username.
-   **Authentication**: Required
-   **Parameters**:
    -   `username` (path parameter) - The username of the organiser whose dashboard to retrieve.

### 11\. Update Organiser Dashboard Visibility Settings

-   **POST** `/dashboardVisibility`
-   **Description**: Update the visibility settings for the organiser's dashboard.
-   **Authentication**: Required
-   **Request Body**:

    `{
      "visibility": "public/private" // New visibility setting
    }`

### 12\. Ban Team

-   **POST** `/banTeam`
-   **Description**: Ban a team associated with the organiser.
-   **Authentication**: Required
-   **Request Body**:

    

    `{
      "teamId": "string" // The ID of the team to be banned
    }`

### 13\. Create Tournament

-   **POST** `/create`
-   **Description**: Create a new tournament.
-   **Authentication**: Required
-   **Request Body**:

    
    `{
      "name": "string",
      "date": "string", // Format: YYYY-MM-DD
      "location": "string",
      "description": "string"
    }`

Responses
---------

-   **200 OK**: Successful request.
-   **400 Bad Request**: Validation error or missing parameters.
-   **401 Unauthorized**: Authentication failed or required.
-   **404 Not Found**: Resource not found.
-   **500 Internal Server Error**: Server error.

# Player API Documentation

## Base URL
`/api/player`

### Endpoints

#### 1. **Player Sign In**
- **URL**: `/signin`
- **Method**: `POST`
- **Description**: Authenticates a player and returns a JWT token.
- **Request Body**:
  ```json
  {
    "email": "string",
    "password": "string"
  } `

-   **Responses**:
    -   **200 OK**: Authentication successful, returns token.
    -   **400 Bad Request**: Missing or invalid credentials.
    -   **401 Unauthorized**: Incorrect email or password.

* * * * *

#### 2\. **Player Sign Up**

-   **URL**: `/signup`
-   **Method**: `POST`
-   **Description**: Registers a new player.
-   **Request Body**:

    json

    Copy code

    `{
      "username": "string",
      "email": "string",
      "password": "string"
    }`

-   **Responses**:
    -   **201 Created**: Player registered successfully.
    -   **400 Bad Request**: Email or username already exists.

* * * * *

#### 3\. **Get Player Profile**

-   **URL**: `/profile`
-   **Method**: `GET`
-   **Description**: Retrieves the authenticated player's profile.
-   **Headers**:
    -   `Authorization`: `Bearer <token>`
-   **Responses**:
    -   **200 OK**: Returns player profile data.
    -   **401 Unauthorized**: Invalid or missing token.

* * * * *

#### 4\. **Update Player Profile**

-   **URL**: `/update`
-   **Method**: `PUT`
-   **Description**: Updates player profile information.
-   **Headers**:
    -   `Authorization`: `Bearer <token>`
-   **Request Body**:


    `{
      "username": "string",
      "email": "string",
      "password": "string" // optional
    }`

-   **Responses**:
    -   **200 OK**: Profile updated successfully.
    -   **400 Bad Request**: Invalid data.
    -   **401 Unauthorized**: Invalid or missing token.

* * * * *

#### 5\. **Search Tournaments**

-   **URL**: `/searchTournaments`
-   **Method**: `GET`
-   **Description**: Searches for tournaments based on query parameters.
-   **Query Parameters**:
    -   `query`: Search term (e.g., tournament name).
-   **Headers**:
    -   `Authorization`: `Bearer <token>`
-   **Responses**:
    -   **200 OK**: Returns a list of matching tournaments.
    -   **401 Unauthorized**: Invalid or missing token.

* * * * *

#### 6\. **Get Player Dashboard**

-   **URL**: `/dashboard`
-   **Method**: `GET`
-   **Description**: Retrieves the player's dashboard information.
-   **Headers**:
    -   `Authorization`: `Bearer <token>`
-   **Responses**:
    -   **200 OK**: Returns dashboard data.
    -   **401 Unauthorized**: Invalid or missing token.

* * * * *

#### 7\. **Logout**

-   **URL**: `/logout`
-   **Method**: `GET`
-   **Description**: Logs out the player by clearing the token.
-   **Responses**:
    -   **200 OK**: Successfully logged out.



# Team API Documentation

## Base URL
```bash
    /api/team
```





## Endpoints

### 1. Create a Team
- **POST** `/create`
- **Description**: Creates a new team.
- **Request Body**:
  ```json
  {
    "name": "string",
    "players": ["playerId1", "playerId2", ...],
    "tournamentId": "string"
  }`

-   **Response**:
    -   **201 Created**: Team created successfully.
    -   **400 Bad Request**: Invalid data.

* * * * *

### 2\. Get Team by ID

-   **GET** `/:teamId`
-   **Description**: Retrieves the details of a team by its ID.
-   **URL Parameters**:
    -   `teamId` (string): The ID of the team to retrieve.
-   **Response**:
    -   **200 OK**: Returns the team details.
    -   **404 Not Found**: Team not found.

* * * * *

### 3\. Update Team

-   **PUT** `/:teamId`
-   **Description**: Updates the information of an existing team.
-   **URL Parameters**:
    -   `teamId` (string): The ID of the team to update.
-   **Request Body**:

    json

    Copy code

    `{
      "name": "string",
      "players": ["playerId1", "playerId2", ...]
    }`

-   **Response**:
    -   **200 OK**: Team updated successfully.
    -   **400 Bad Request**: Invalid data.
    -   **404 Not Found**: Team not found.

* * * * *

### 4\. Delete Team

-   **DELETE** `/:teamId`
-   **Description**: Deletes a team by its ID.
-   **URL Parameters**:
    -   `teamId` (string): The ID of the team to delete.
-   **Response**:
    -   **200 OK**: Team deleted successfully.
    -   **404 Not Found**: Team not found.

* * * * *

### 5\. Get All Teams

-   **GET** `/`
-   **Description**: Retrieves a list of all teams.
-   **Response**:
    -   **200 OK**: Returns an array of teams.
    -   **204 No Content**: No teams available.

* * * * *

### 6\. Search Teams

-   **GET** `/search`
-   **Description**: Searches for teams based on a query parameter.
-   **Query Parameters**:
    -   `name` (string): Name of the team to search.
-   **Response**:
    -   **200 OK**: Returns an array of matching teams.
    -   **204 No Content**: No teams found.

# Tournament API Documentation

## Base URL
```bash
    /api/tournament
```





### Endpoints

---

### **1. Create Tournament**

- **POST** `/create`
  
  - **Description**: Creates a new tournament.
  
  - **Request Body**:
    ```json
    {
      "name": "Tournament Name",
      "description": "Tournament Description",
      "date": "2024-12-31",
      "location": "Location",
      "organiserId": "organiserId"
    }
    ```
  
  - **Response**:
    - **200 OK**: Returns the created tournament object.
    - **400 Bad Request**: Returns an error message if the request body is invalid.
  
---

### **2. Get All Tournaments**

- **GET** `/`

  - **Description**: Retrieves a list of all tournaments.
  
  - **Response**:
    - **200 OK**: Returns an array of tournament objects.
  
---

### **3. Get Tournament by ID**

- **GET** `/:id`
  
  - **Description**: Retrieves a specific tournament by its ID.
  
  - **Parameters**:
    - `id` (path parameter): The ID of the tournament to retrieve.
  
  - **Response**:
    - **200 OK**: Returns the tournament object.
    - **404 Not Found**: Returns an error message if the tournament is not found.
  
---

### **4. Update Tournament**

- **PUT** `/:id`
  
  - **Description**: Updates an existing tournament by its ID.
  
  - **Parameters**:
    - `id` (path parameter): The ID of the tournament to update.
  
  - **Request Body**:
    ```json
    {
      "name": "Updated Tournament Name",
      "description": "Updated Description",
      "date": "2024-12-31",
      "location": "Updated Location"
    }
    ```
  
  - **Response**:
    - **200 OK**: Returns the updated tournament object.
    - **400 Bad Request**: Returns an error message if the request body is invalid.
    - **404 Not Found**: Returns an error message if the tournament is not found.
  
---

### **5. Delete Tournament**

- **DELETE** `/:id`
  
  - **Description**: Deletes a specific tournament by its ID.
  
  - **Parameters**:
    - `id` (path parameter): The ID of the tournament to delete.
  
  - **Response**:
    - **200 OK**: Returns a success message.
    - **404 Not Found**: Returns an error message if the tournament is not found.
  
---

### **6. Approve Tournament**

- **POST** `/approve/:id`
  
  - **Description**: Approves a tournament by its ID.
  
  - **Parameters**:
    - `id` (path parameter): The ID of the tournament to approve.
  
  - **Response**:
    - **200 OK**: Returns the approved tournament object.
    - **404 Not Found**: Returns an error message if the tournament is not found.
  
---

### **7. Search Tournaments**

- **GET** `/search`
  
  - **Description**: Searches for tournaments based on query parameters.
  
  - **Query Parameters**:
    - `name`: The name of the tournament to search for.
    - `date`: The date of the tournament to search for.
  
  - **Response**:
    - **200 OK**: Returns an array of matching tournament objects.
  
---
 ### Notes
- Replace the `<token>` placeholder with the actual JWT token obtained during the sign-in process.
- The responses section should be adjusted based on your actual implementation and error handling.

Feel free to customize any part of this documentation to better fit your specific use case!`

Notes
-----

-   Ensure that the user is authenticated before making requests to these endpoints.
## Error Handling

All endpoints return appropriate status codes and messages based on the outcome of the request. Common error responses include:

- **400 Bad Request**: Indicates that the request is malformed or missing required information.
- **401 Unauthorized**: Indicates that the user is not authenticated (if applicable).
- **404 Not Found**: Indicates that the requested resource does not exist.
