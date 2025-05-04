/**
 * @swagger
 * tags:
 *   name: Tournaments
 *   description: API endpoints for tournament operations
 */

/**
 * @swagger
 * /api/tournament/create:
 *   post:
 *     tags: [Tournaments]
 *     summary: "Create a Tournament"
 *     description: "This endpoint allows an organiser to create a new tournament."
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               tid:
 *                 type: string
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               startDate:
 *                 type: string
 *                 format: date
 *               endDate:
 *                 type: string
 *                 format: date
 *               entryFee:
 *                 type: number
 *               prizePool:
 *                 type: number
 *             required:
 *               - tid
 *               - name
 *               - startDate
 *               - endDate
 *               - entryFee
 *               - prizePool
 *               - description
 *     responses:
 *       "200":
 *         description: "Tournament created successfully."
 *       "400":
 *         description: "Error creating the tournament."
 *       "401":
 *         description: "Unauthorized, the organiser must be authenticated."
 *       "500":
 *         description: "Error while creating tournament."
 */
router.post('/api/tournament/create', authenticateOrganiser, tournamentController.createTournament);


/**
 * @swagger
 * /api/tournament/{tournamentId}:
 *   get:
 *     tags: [Tournaments]
 *     summary: "Get Tournament by ID"
 *     description: "This endpoint allows anyone to get the details of a specific tournament by its ID."
 *     parameters:
 *       - in: path
 *         name: tournamentId
 *         required: true
 *         schema:
 *           type: string
 *         description: "The ID of the tournament."
 *     responses:
 *       "200":
 *         description: "Tournament details retrieved successfully."
 *       "404":
 *         description: "Tournament not found."
 */
router.get('/api/tournament/:tournamentId', authenticateUser, tournamentController.getTournamentById);


/**
 * @swagger
 * /api/tournament/edit/{tournamentId}:
 *   get:
 *     tags: [Tournaments]
 *     summary: "Edit Tournament"
 *     description: "This endpoint allows an organiser to edit a tournament."
 *     parameters:
 *       - in: path
 *         name: tournamentId
 *         required: true
 *         schema:
 *           type: string
 *         description: "The ID of the tournament to edit."
 *     responses:
 *       "200":
 *         description: "Tournament edit page loaded successfully."
 *       "404":
 *         description: "Tournament not found."
 */
router.get('/api/tournament/edit/:tournamentId', authenticateOrganiser, tournamentController.getTournamentEditPage);


/**
 * @swagger
 * /api/tournament/join/{tournamentId}:
 *   post:
 *     tags: [Tournaments]
 *     summary: "Join a Tournament"
 *     description: "This endpoint allows a player to join a tournament."
 *     parameters:
 *       - in: path
 *         name: tournamentId
 *         required: true
 *         schema:
 *           type: string
 *         description: "The ID of the tournament to join."
 *     responses:
 *       "200":
 *         description: "Player joined the tournament successfully."
 *       "400":
 *         description: "Error joining the tournament."
 */
router.post('/api/tournament/join/:tournamentId', authenticateUser, tournamentController.joinTournament);


/**
 * @swagger
 * /api/tournament/leave/{tournamentId}:
 *   post:
 *     tags: [Tournaments]
 *     summary: "Leave a Tournament"
 *     description: "This endpoint allows a player to leave a tournament."
 *     parameters:
 *       - in: path
 *         name: tournamentId
 *         required: true
 *         schema:
 *           type: string
 *         description: "The ID of the tournament to leave."
 *     responses:
 *       "200":
 *         description: "Player left the tournament successfully."
 *       "400":
 *         description: "Error leaving the tournament."
 */
router.post('/api/tournament/leave/:tournamentId', authenticateUser, tournamentController.leaveTournament);


/**
 * @swagger
 * /api/tournament/update/{tournamentId}:
 *   post:
 *     tags: [Tournaments]
 *     summary: "Update Tournament"
 *     description: "This endpoint allows an organiser to update a tournament."
 *     parameters:
 *       - in: body
 *         name: tournament
 *         required: true
 *         schema:
 *           type: object
 *           properties:
 *             name:
 *               type: string
 *             description:
 *               type: string
 *             startDate:
 *               type: string
 *               format: date
 *             endDate:
 *               type: string
 *               format: date
 *             entryFee:
 *               type: number
 *             prizePool:
 *               type: number
 *     responses:
 *       "200":
 *         description: "Tournament updated successfully."
 *       "400":
 *         description: "Error updating the tournament."
 */
router.post('/api/tournament/update/:tournamentId', authenticateOrganiser, tournamentController.updateTournament);

/**
 * @swagger
 * /api/tournament/updatePointsTable:
 *   post:
 *     tags: [Tournaments]
 *     summary: "Update Points Table"
 *     description: "This endpoint allows an organiser to update the points table of the tournament."
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               tid:
 *                 type: number
 *                 description: "The ID of the tournament to update."
 *               pointsTable:
 *                 type: array
 *                 description: "Array of team names and points to be updated."
 *                 items:
 *                   type: object
 *                   properties:
 *                     teamName:
 *                       type: string
 *                       description: "Name of the team."
 *                     Totalpoints:
 *                       type: number
 *                       description: "Points to be added for the team."
 *     responses:
 *       "200":
 *         description: "Points table updated successfully."
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Points table updated successfully."
 *       "400":
 *         description: "Invalid request or error updating points table."
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Invalid request body format."
 *       "403":
 *         description: "Unauthorized: Not the organiser of this tournament."
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Unauthorized: You are not the organiser of this tournament."
 *       "404":
 *         description: "Tournament or team not found."
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Tournament not found."
 *       "500":
 *         description: "Internal server error."
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Internal server error."
 */

router.post('/api/tournament/updatePointsTable', authenticateOrganiser, tournamentController.updatePointsTable);

/**
 * @swagger
 * /api/tournament/pointsTable/{tournamentId}:
 *   get:
 *     tags: [Tournaments]
 *     summary: "Get Points Table"
 *     description: "This endpoint allows anyone to view the points table of a specific tournament."
 *     parameters:
 *       - in: path
 *         name: tournamentId
 *         required: true
 *         schema:
 *           type: string
 *         description: "The ID of the tournament to retrieve the points table for."
 *     responses:
 *       "200":
 *         description: "Points table retrieved successfully."
 *       "404":
 *         description: "Tournament not found."
 */
router.get('/api/tournament/pointsTable/:tournamentId', authenticateUser, tournamentController.getPointsTable);


/**
 * @swagger
 * /api/tournament/updateWinner:
 *   put:
 *     tags: [Tournaments]
 *     summary: "Update Tournament Winner"
 *     description: "Allows an organiser to update the winner of a specific tournament."
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               tournamentId:
 *                 type: string
 *                 description: "The ID of the tournament to update."
 *                 example: "64d2a1e5e4cde4359f0e0f89"
 *               winnerId:
 *                 type: string
 *                 description: "The ID of the winning team."
 *                 example: "64d2a1e5e4cde4359f0e0f12"
 *     responses:
 *       "200":
 *         description: "Tournament winner updated successfully."
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Winner updated successfully"
 *                 tournament:
 *                   type: object
 *                   description: "Updated tournament details"
 *       "400":
 *         description: "Bad request due to missing or invalid input."
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Invalid tournament ID or winner ID."
 *       "403":
 *         description: "Forbidden. The user is not authorised to update this tournament."
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Only the organiser can update the winner."
 *       "404":
 *         description: "Tournament or player not found."
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Tournament not found."
 *       "500":
 *         description: "Internal server error."
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Error updating winner."
 */
router.put('/api/tournament/updateWinner', authenticateOrganiser, tournamentController.updateWinner);


/**
 * @swagger
 * /api/tournament/edit/{tournamentId}:
 *   post:
 *     tags: [Tournaments]
 *     summary: "Edit Tournament"
 *     description: "Allows an organiser to edit tournament details."
 *     parameters:
 *       - in: path
 *         name: tournamentId
 *         required: true
 *         schema:
 *           type: string
 *         description: "The ID of the tournament to edit."
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               startDate:
 *                 type: string
 *                 format: date
 *               endDate:
 *                 type: string
 *                 format: date
 *               entryFee:
 *                 type: number
 *               prizePool:
 *                 type: number
 *     responses:
 *       "200":
 *         description: "Tournament updated successfully."
 *       "404":
 *         description: "Tournament not found."
 *       "500":
 *         description: "Server error."
 */
router.post('/api/tournament/edit/:tournamentId', authenticateOrganiser, tournamentController.editTournament);