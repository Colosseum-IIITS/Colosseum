/**
 * @swagger
 * /api/tournament/create:
 *   post:
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
 *     summary: "Update Points Table"
 *     description: "This endpoint allows an organiser to update the points table of the tournament."
 *     parameters:
 *       - in: body
 *         name: pointsTable
 *         required: true
 *         schema:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               teamName:
 *                 type: string
 *               points:
 *                 type: number
 *     responses:
 *       "200":
 *         description: "Points table updated successfully."
 *       "400":
 *         description: "Error updating points table."
 */
router.post('/api/tournament/updatePointsTable', authenticateOrganiser, tournamentController.updatePointsTable);


/**
 * @swagger
 * /api/tournament/pointsTable/{tournamentId}:
 *   get:
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
 *     summary: "Update Tournament Winner"
 *     description: "This endpoint allows an organiser to update the winner of the tournament."
 *     parameters:
 *       - in: body
 *         name: winner
 *         required: true
 *         schema:
 *           type: object
 *           properties:
 *             winnerId:
 *               type: string
 *               description: "The ID of the winning team."
 *     responses:
 *       "200":
 *         description: "Tournament winner updated successfully."
 *       "400":
 *         description: "Error updating tournament winner."
 */
router.put('/api/tournament/updateWinner', authenticateOrganiser, tournamentController.updateWinner);


/**
 * @swagger
 * /api/tournament/edit/{tournamentId}:
 *   post:
 *     summary: "Edit Tournament"
 *     description: "This endpoint allows an organiser to edit tournament details after creation."
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
 *     responses:
 *       "200":
 *         description: "Tournament edited successfully."
 *       "400":
 *         description: "Error editing tournament."
 */
router.post('/api/tournament/edit/:tournamentId', authenticateOrganiser, tournamentController.editTournament);
