/**
 * @swagger
 * /api/player/searchTournaments:
 *   get:
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
 *     summary: "Follow an Organiser"
 *     description: "This endpoint allows a player to follow an organiser."
 *     parameters:
 *       - in: body
 *         name: organiserId
 *         required: true
 *         schema:
 *           type: object
 *           properties:
 *             organiserId:
 *               type: string
 *     responses:
 *       "200":
 *         description: "Player followed the organiser successfully."
 *       "400":
 *         description: "Error following the organiser."
 */
router.post('/api/player/followOrganiser', authenticateUser, playerController.followOrganiser);

/**
 * @swagger
 * /player/unFollowOrganiser:
 *   post:
 *     summary: "Unfollow an Organiser"
 *     description: "This endpoint allows a player to unfollow an organiser."
 *     parameters:
 *       - in: body
 *         name: organiserId
 *         required: true
 *         schema:
 *           type: object
 *           properties:
 *             organiserId:
 *               type: string
 *     responses:
 *       "200":
 *         description: "Player unfollowed the organiser successfully."
 *       "400":
 *         description: "Error unfollowing the organiser."
 */
router.post('/unFollowOrganiser', authenticateUser, playerController.unfollowOrganiser);

/**
 * @swagger
 * /player/joinTournament:
 *   post:
 *     summary: "Join a Tournament"
 *     description: "This endpoint allows a player to join a tournament."
 *     parameters:
 *       - in: body
 *         name: tournamentId
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
router.post('/joinTournament', authenticateUser, playerController.joinTournament);

/**
 * @swagger
 * /player/updateUsername:
 *   post:
 *     summary: "Update Player Username"
 *     description: "This endpoint allows a player to update their username."
 *     parameters:
 *       - in: body
 *         name: username
 *         required: true
 *         schema:
 *           type: object
 *           properties:
 *             username:
 *               type: string
 *     responses:
 *       "200":
 *         description: "Username updated successfully."
 *       "400":
 *         description: "Invalid username format or error."
 */
router.post('/updateUsername', authenticateUser, playerController.updateUsername);

/**
 * @swagger
 * /player/updatePassword:
 *   post:
 *     summary: "Update Player Password"
 *     description: "This endpoint allows a player to update their password."
 *     parameters:
 *       - in: body
 *         name: password
 *         required: true
 *         schema:
 *           type: object
 *           properties:
 *             password:
 *               type: string
 *     responses:
 *       "200":
 *         description: "Password updated successfully."
 *       "400":
 *         description: "Invalid password format or other error."
 */
router.post('/updatePassword', authenticateUser, playerController.updatePassword);

/**
 * @swagger
 * /player/updateEmail:
 *   post:
 *     summary: "Update Player Email"
 *     description: "This endpoint allows a player to update their email."
 *     parameters:
 *       - in: body
 *         name: email
 *         required: true
 *         schema:
 *           type: object
 *           properties:
 *             email:
 *               type: string
 *     responses:
 *       "200":
 *         description: "Email updated successfully."
 *       "400":
 *         description: "Invalid email format or other error."
 */
router.post('/updateEmail', authenticateUser, playerController.updateEmail);

/**
 * @swagger
 * /player/updateProfile:
 *   post:
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
router.post('/updateProfile', authenticateUser, playerController.updateProfile);

/**
 * @swagger
 * /player/tournamentsPlayed:
 *   get:
 *     summary: "Get Tournaments Played"
 *     description: "This endpoint allows a player to get the list of tournaments they have played in."
 *     responses:
 *       "200":
 *         description: "List of tournaments the player has participated in."
 *       "404":
 *         description: "No tournaments found."
 */
router.get('/tournamentsPlayed', authenticateUser, playerController.getTournamentsPlayed);

/**
 * @swagger
 * /player/tournamentsWon:
 *   get:
 *     summary: "Get Tournaments Won"
 *     description: "This endpoint allows a player to get the list of tournaments they have won."
 *     responses:
 *       "200":
 *         description: "List of tournaments the player has won."
 *       "404":
 *         description: "No tournaments found."
 */
router.get('/tournamentsWon', authenticateUser, playerController.getTournamentsWon);

/**
 * @swagger
 * /player/ranking:
 *   get:
 *     summary: "Get Player Ranking"
 *     description: "This endpoint allows a player to get their ranking."
 *     responses:
 *       "200":
 *         description: "Player ranking fetched successfully."
 *       "404":
 *         description: "Player not found."
 */
router.get('/ranking', authenticateUser, playerController.getPlayerRanking);

/**
 * @swagger
 * /player/searchOrganisers:
 *   get:
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
router.get('/searchOrganisers', authenticateUser, organiserController.getOrganiserByUsername);

/**
 * @swagger
 * /player/report-team:
 *   post:
 *     summary: "Report a Team"
 *     description: "This endpoint allows a player to report a team."
 *     parameters:
 *       - in: body
 *         name: report
 *         required: true
 *         schema:
 *           type: object
 *           properties:
 *             teamId:
 *               type: string
 *             reason:
 *               type: string
 *     responses:
 *       "200":
 *         description: "Team reported successfully."
 *       "400":
 *         description: "Error reporting the team."
 */
router.post('/report-team', authenticateUser, reportController.reportTeam);

/**
 * @swagger
 * /player/report-organiser:
 *   post:
 *     summary: "Report an Organiser"
 *     description: "This endpoint allows a player to report an organiser."
 *     parameters:
 *       - in: body
 *         name: report
 *         required: true
 *         schema:
 *           type: object
 *           properties:
 *             organiserId:
 *               type: string
 *             reason:
 *               type: string
 *     responses:
 *       "200":
 *         description: "Organiser reported successfully."
 *       "400":
 *         description: "Error reporting the organiser."
 */
router.post('/report-organiser', authenticateUser, reportController.reportOrganiser);

/**
 * @swagger
 * /player/dashboard:
 *   get:
 *     summary: "Get Player Dashboard"
 *     description: "This endpoint allows a player to view their dashboard."
 *     responses:
 *       "200":
 *         description: "Player dashboard retrieved successfully."
 *       "404":
 *         description: "Player not found."
 */
router.get('/dashboard', authenticateUser, playerController.getDashboard);

/**
 * @swagger
 * /player/teamName:
 *   get:
 *     summary: "Search Teams by Name"
 *     description: "This endpoint allows a player to search for teams by name."
 *     parameters:
 *       - in: query
 *         name: teamName
 *         required: false
 *         schema:
 *           type: string
 *         description: "The name of the team to search for."
 *     responses:
 *       "200":
 *         description: "Teams found successfully."
 *       "404":
 *         description: "No teams found."
 */
router.get('/teamName', authenticateUser, teamController.getTeamsByName);

/**
 * @swagger
 * /player/followedOrg:
 *   get:
 *     summary: "Get Followed Organisers"
 *     description: "This endpoint allows a player to get the list of organisers they are following."
 *     responses:
 *       "200":
 *         description: "List of followed organisers."
 *       "404":
 *         description: "No organisers found."
 */
router.get('/followedOrg', authenticateUser, organiserController.getMyOrganisers);

/**
 * @swagger
 * /player/homepage:
 *   get:
 *     summary: "Get Player Homepage"
 *     description: "This endpoint allows a player to view their homepage with relevant information."
 *     responses:
 *       "200":
 *         description: "Homepage data fetched successfully."
 *       "404":
 *         description: "Player not found."
 */
router.get('/homepage', authenticateUser, playerController.getHomePage);

/**
 * @swagger
 * /player/joinTeam:
 *   post:
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
