/**
 * @swagger
 * tags:
 *   name: Players
 *   description: API endpoints for player operations
 */

/**
 * @swagger
 * /api/player/searchTournaments:
 *   get:
 *     tags: [Players]
 *     summary: "Search for Tournaments"
 *     description: "This endpoint allows a player to search for tournaments by their name or ID. Only approved tournaments are included in the results."
 *     parameters:
 *       - in: query
 *         name: searchTerm
 *         required: false
 *         schema:
 *           type: string
 *         description: "The name or ID of the tournament to search for."
 *     responses:
 *       "200":
 *         description: "Tournaments fetched successfully."
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Tournaments fetched successfully"
 *                 results:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       tid:
 *                         type: string
 *                         example: "12345"
 *                       name:
 *                         type: string
 *                         example: "Summer Championship"
 *                       status:
 *                         type: string
 *                         example: "Approved"
 *                 searchTerm:
 *                   type: string
 *                   example: "Championship"
 *                 joinedTournaments:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       tid:
 *                         type: string
 *                         example: "67890"
 *                       name:
 *                         type: string
 *                         example: "Winter League"
 *       "500":
 *         description: "Internal server error."
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Error searching tournaments"
 *                 details:
 *                   type: string
 *                   example: "Database connection failed."
 */

router.get('/api/player/searchTournaments', authenticateUser, playerController.searchTournaments);

/**
 * @swagger
 * /api/player/searchPlayer:
 *   get:
 *     tags: [Players]
 *     summary: "Search Player"
 *     description: "This endpoint allows a player to search for another player using username or email."
 *     parameters:
 *       - in: query
 *         name: searchTerm
 *         required: true
 *         schema:
 *           type: string
 *         description: "The search term to find a player (username or email)."
 *     responses:
 *       "200":
 *         description: "Players found successfully."
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 results:
 *                   type: array
 *                   items:
 *                     type: object
 *                   description: "List of players matching the search term."
 *                 searchTerm:
 *                   type: string
 *       "400":
 *         description: "Search term is missing."
 *       "500":
 *         description: "Internal server error."
 */

router.get('/api/player/searchPlayer', authenticateUser, playerController.searchPlayer);

/**
 * @swagger
 * /api/player/followOrganiser:
 *   post:
 *     tags: [Players]
 *     summary: "Follow an Organiser"
 *     description: "This endpoint allows a player to follow an organiser."
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               organiserId:
 *                 type: string
 *     responses:
 *       "200":
 *         description: "Player followed the organiser successfully."
 *       "400":
 *         description: "Invalid organiserId or error following the organiser."
 *       "404":
 *         description: "Player or Organiser not found."
 *       "500":
 *         description: "Internal server error."
 */
router.post('/api/player/followOrganiser', authenticateUser, playerController.followOrganiser);


/**
 * @swagger
 * /api/player/unFollowOrganiser:
 *   post:
 *     tags: [Players]
 *     summary: "Unfollow an Organiser"
 *     description: "This endpoint allows a player to unfollow an organiser."
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               organiserId:
 *                 type: string
 *     responses:
 *       "200":
 *         description: "Player unfollowed the organiser successfully."
 *       "400":
 *         description: "Invalid organiser ID format or error unfollowing the organiser."
 *       "404":
 *         description: "Player or Organiser not found."
 *       "500":
 *         description: "Internal server error."
 */
router.post('/api/player/unFollowOrganiser', authenticateUser, playerController.unfollowOrganiser);


/**
 * @swagger
 * /api/player/joinTournament:
 *   post:
 *     tags: [Players]
 *     summary: "Join a Tournament"
 *     description: "This endpoint allows a player to join a tournament."
 *     parameters:
 *       - in: body
 *         name: body
 *         required: true
 *         schema:
 *           type: object
 *           properties:
 *             tournamentId:
 *               type: string
 *     responses:
 *       "200":
 *         description: "Player joined the tournament successfully."
 *       "400":
 *         description: "Error joining the tournament."
 */
router.post('/api/player/joinTournament', authenticateUser, playerController.joinTournament);
/**
 * @swagger
 * /api/player/updateUsername:
 *   post:
 *     tags: [Players]
 *     summary: "Update Player Username"
 *     description: "This endpoint allows a player to update their username."
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *     responses:
 *       "200":
 *         description: "Username updated successfully."
 *       "400":
 *         description: "Invalid username format or error."
 */
router.post('/api/player/updateUsername', authenticateUser, playerController.updateUsername);


/**
 * @swagger
 * /api/player/updatePassword:
 *   post:
 *     tags: [Players]
 *     summary: "Update Player Password"
 *     description: "This endpoint allows a player to update their password."
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               password:
 *                 type: string
 *                 format: password
 *     responses:
 *       "200":
 *         description: "Password updated successfully."
 *       "400":
 *         description: "Invalid password format or other error."
 */
router.post('/api/player/updatePassword', authenticateUser, playerController.updatePassword);


/**
 * @swagger
 * /api/player/updateEmail:
 *   post:
 *     tags: [Players]
 *     summary: "Update Player Email"
 *     description: "This endpoint allows a player to update their email."
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *     responses:
 *       "200":
 *         description: "Email updated successfully."
 *       "400":
 *         description: "Invalid email format or other error."
 */
router.post('/api/player/updateEmail', authenticateUser, playerController.updateEmail);

/**
 * @swagger
 * /api/player/updateProfile:
 *   post:
 *     tags: [Players]
 *     summary: "Update Player Profile"
 *     description: "This endpoint allows a player to update their profile information."
 *     parameters:
 *       - in: body
 *         name: profile
 *         required: true
 *         schema:
 *           type: object
 *           properties:
 *             profilePhoto:
 *               type: string
 *               description: "URL of the profile photo."
 *             description:
 *               type: string
 *               description: "A brief description about the player."
 *     responses:
 *       "200":
 *         description: "Profile updated successfully."
 *       "400":
 *         description: "Invalid profile data or other error."
 */
router.post('/api/player/updateProfile', authenticateUser, playerController.updateProfile);

/**
 * @swagger
 * /api/player/tournamentsPlayed:
 *   get:
 *     tags: [Players]
 *     summary: "Get Tournaments Played"
 *     description: "This endpoint allows a player to get the list of tournaments they have played in."
 *     responses:
 *       "200":
 *         description: "List of tournaments the player has participated in."
 *       "404":
 *         description: "No tournaments found."
 */
router.get('/api/player/tournamentsPlayed', authenticateUser, playerController.getTournamentsPlayed);

/**
 * @swagger
 * /api/player/tournamentsWon:
 *   get:
 *     tags: [Players]
 *     summary: "Get Tournaments Won"
 *     description: "This endpoint allows a player to get the list of tournaments they have won."
 *     responses:
 *       "200":
 *         description: "List of tournaments the player has won."
 *       "404":
 *         description: "No tournaments found."
 */
router.get('/api/player/tournamentsWon', authenticateUser, playerController.getTournamentsWon);

/**
 * @swagger
 * /api/player/ranking:
 *   get:
 *     tags: [Players]
 *     summary: "Get Player Ranking"
 *     description: "This endpoint allows a player to get their ranking."
 *     responses:
 *       "200":
 *         description: "Player ranking fetched successfully."
 *       "404":
 *         description: "Player not found."
 */
router.get('/api/player/ranking', authenticateUser, playerController.getPlayerRanking);

/**
 * @swagger
 * /api/player/searchOrganisers:
 *   get:
 *     tags: [Players]
 *     summary: "Search Organisers"
 *     description: "This endpoint allows a player to search for organisers."
 *     parameters:
 *       - in: query
 *         name: organiserName
 *         required: false
 *         schema:
 *           type: string
 *         description: "The name of the organiser to search for."
 *     responses:
 *       "200":
 *         description: "Organisers found successfully."
 *       "404":
 *         description: "No organisers found."
 */
router.get('/api/player/searchOrganisers', authenticateUser, organiserController.getOrganiserByUsername);

/**
 * @swagger
 * /api/player/report-team:
 *   post:
 *     tags: [Players]
 *     summary: "Report a Team"
 *     description: "This endpoint allows a player to report a team."
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               teamName:
 *                 type: string
 *               reason:
 *                 type: string
 *     responses:
 *       "200":
 *         description: "Team reported successfully."
 *       "400":
 *         description: "Error reporting the team."
 */
router.post('/api/player/report-team', authenticateUser, reportController.reportTeam);


/**
 * @swagger
 * /api/player/report-organiser:
 *   post:
 *     tags: [Players]
 *     summary: "Report an Organiser"
 *     description: "This endpoint allows a player to report an organiser."
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               organiserName:
 *                 type: string
 *               reason:
 *                 type: string
 *             required:
 *               - organiserName
 *               - reason
 *     responses:
 *       "200":
 *         description: "Organiser reported successfully."
 *       "404":
 *         description: "Organiser not found."
 *       "400":
 *         description: "Error reporting the organiser."
 */

router.post('/api/player/report-organiser', authenticateUser, reportController.reportOrganiser);

/**
 * @swagger
 * /api/player/dashboard:
 *   get:
 *     tags: [Players]
 *     summary: "Get Player Dashboard"
 *     description: "This endpoint allows a player to view their dashboard."
 *     responses:
 *       "200":
 *         description: "Player dashboard retrieved successfully."
 *       "404":
 *         description: "Player not found."
 */
router.get('/api/player/dashboard', authenticateUser, playerController.getDashboard);

/**
 * @swagger
 * /api/player/teamName:
 *   get:
 *     tags: [Players]
 *     summary: "Search Teams by Name"
 *     description: "This endpoint allows a player to search for teams by name."
 *     parameters:
 *       - in: query
 *         name: searchTerm
 *         required: true
 *         schema:
 *           type: string
 *         description: "The name of the team to search for."
 *     responses:
 *       "200":
 *         description: "Teams found successfully."
 *       "404":
 *         description: "No teams found."
 */
router.get('/api/player/teamName', authenticateUser, teamController.getTeamsByName);


/**
 * @swagger
 * /api/player/followedOrg:
 *   get:
 *     tags: [Players]
 *     summary: "Get Followed Organisers"
 *     description: "This endpoint allows a player to get the list of organisers they are following."
 *     responses:
 *       "200":
 *         description: "List of followed organisers."
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 followedOrganisers:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       _id:
 *                         type: string
 *                       name:
 *                         type: string
 *       "404":
 *         description: "No organisers found."
 *       "500":
 *         description: "Error retrieving organisers."
 */

/**
 * @swagger
 * /player/joinTeam:
 *   post:
 *     tags: [Players]
 *     summary: "Join a Team"
 *     description: "This endpoint allows a player to join a team."
 *     parameters:
 *       - in: body
 *         name: teamId
 *         required: true
 *         schema:
 *           type: object
 *           properties:
 *             teamId:
 *               type: string
 *     responses:
 *       "200":
 *         description: "Player joined the team successfully."
 *       "400":
 *         description: "Error joining the team."
 */
router.post('/joinTeam', authenticateUser, teamController.joinTeam);