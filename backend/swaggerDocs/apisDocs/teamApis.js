/**
 * @swagger
 * tags:
 *   - name: Team
 *     description: All team-related operations
 */

/**
 * @swagger
 * /api/team/create:
 *   post:
 *     tags: [Team]
 *     summary: "Create a Team"
 *     description: "This endpoint allows a player to create a new team."
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *             properties:
 *               name:
 *                 type: string
 *               logo:
 *                 type: string
 *                 description: "URL of the team logo."
 *             
 *     responses:
 *       "201":
 *         description: "Team created successfully."
 *       "400":
 *         description: "Invalid team data."
 *       "500":
 *         description: "Error creating team."
 */
router.post('/api/team/create', authenticateUser, teamController.createTeam);


/**
 * @swagger
 * /api/player/joinTeam:
 *   post:
 *     tags: [Team]
 *     summary: "Join a Team"
 *     description: "This endpoint allows a player to join an existing team."
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               teamId:
 *                 type: string
 *                 description: "The ID of the team to join."
 *             required:
 *               - teamId
 *     responses:
 *       "200":
 *         description: "Player joined the team successfully."
 *       "400":
 *         description: "Error joining the team."
 *       "404":
 *         description: "Team not found."
 *       "500":
 *         description: "Error joining team."
 */
router.post('/player/joinTeam', authenticateUser, teamController.joinTeam);


/**
 * @swagger
 * /api/team/request:
 *   post:
 *     tags: [Team]
 *     summary: "Request to Join a Team"
 *     description: "This endpoint allows a player to request to join an existing team."
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               teamId:
 *                 type: string
 *                 description: "The ID of the team to request joining."
 *             required:
 *               - teamId
 *     responses:
 *       "200":
 *         description: "Join request sent successfully."
 *       "400":
 *         description: "Error sending join request."
 *       "404":
 *         description: "Team not found."
 *       "500":
 *         description: "Error sending join request."
 */
router.post('/api/team/request', authenticateUser, teamController.requestToJoinTeam);


/**
 * @swagger
 * /api/team/leave:
 *   post:
 *     tags: [Team]
 *     summary: "Leave a Team"
 *     description: "This endpoint allows a player to leave their current team."
 *     responses:
 *       "200":
 *         description: "Player left the team successfully."
 *       "400":
 *         description: "Error leaving the team."
 *       "404":
 *         description: "Player not in a team."
 *       "500":
 *         description: "Error leaving team."
 */
router.post('/api/team/leave', authenticateUser, teamController.leaveTeam);


/**
 * @swagger
 * /api/team/search:
 *   get:
 *     tags: [Team]
 *     summary: "Search for Teams"
 *     description: "This endpoint allows searching for teams by name."
 *     parameters:
 *       - in: query
 *         name: searchTerm
 *         required: false
 *         schema:
 *           type: string
 *         description: "The name of the team to search for."
 *     responses:
 *       "200":
 *         description: "Teams found successfully."
 *       "404":
 *         description: "No teams found."
 *       "500":
 *         description: "Error fetching teams."
 */
router.get('/api/team/search', teamController.getTeamsByName);


/**
 * @swagger
 * /api/team/updateTeamName:
 *   post:
 *     tags: [Team]
 *     summary: "Update Team Name"
 *     description: "This endpoint allows the team captain to update the team name."
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               newName:
 *                 type: string
 *                 description: "The new name of the team."
 *             required:
 *               - newName
 *     responses:
 *       "200":
 *         description: "Team name updated successfully."
 *       "400":
 *         description: "Error updating team name."
 *       "403":
 *         description: "Only the team captain can update the team name."
 *       "500":
 *         description: "Error updating team name."
 */
router.post('/api/team/updateTeamName', authenticateUser, teamController.updateTeamName);


/**
 * @swagger
 * /api/team/{teamId}/requests:
 *   get:
 *     tags: [Team]
 *     summary: "Get Join Requests"
 *     description: "This endpoint allows the team captain to view join requests."
 *     parameters:
 *       - in: path
 *         name: teamId
 *         required: true
 *         schema:
 *           type: string
 *         description: "The ID of the team to fetch the join requests."
 *     responses:
 *       "200":
 *         description: "Join requests retrieved successfully."
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 joinRequests:
 *                   type: array
 *                   items:
 *                     type: string
 *                   description: "List of players who have requested to join the team."
 *       "403":
 *         description: "Only the team captain can view join requests."
 *       "404":
 *         description: "Team not found or player is not part of the team."
 *       "500":
 *         description: "Error fetching join requests."
 */
router.get('/api/team/:teamId/requests', authenticateUser, teamController.getJoinRequests);


/**
 * @swagger
 * /api/team/accept:
 *   post:
 *     tags: [Team]
 *     summary: "Accept Join Request"
 *     description: "This endpoint allows the captain to accept a join request."
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               playerId:
 *                 type: string
 *                 description: "ID of the player requesting to join the team."
 *             required:
 *               - playerId
 *     responses:
 *       "200":
 *         description: "Join request accepted successfully."
 *       "400":
 *         description: "Error accepting join request."
 *       "403":
 *         description: "Only the team captain can accept join requests."
 *       "500":
 *         description: "Error accepting join request."
 */
router.post('/api/team/accept', authenticateUser, teamController.acceptJoinRequest);


/**
 * @swagger
 * /api/team/reject:
 *   post:
 *     tags: [Team]
 *     summary: "Reject Join Request"
 *     description: "This endpoint allows the captain to reject a join request."
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               playerId:
 *                 type: string
 *                 description: "ID of the player requesting to join the team."
 *             required:
 *               - playerId
 *     responses:
 *       "200":
 *         description: "Join request rejected successfully."
 *       "400":
 *         description: "Error rejecting join request."
 *       "403":
 *         description: "Only the team captain can reject join requests."
 *       "500":
 *         description: "Error rejecting join request."
 */
router.post('/api/team/reject', authenticateUser, teamController.rejectJoinRequest);
