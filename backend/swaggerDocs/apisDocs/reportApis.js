/**
 * @swagger
 * /api/report/PreportT2O:
 *   post:
 *     summary: "Report a Team"
 *     description: "This endpoint allows a player to report a team to an organiser."
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               teamName:  # Corrected from 'teamId' to 'teamName'
 *                 type: string
 *               reason:
 *                 type: string
 *     responses:
 *       "200":
 *         description: "Team reported successfully."
 *       "400":
 *         description: "Error reporting the team."
 */

router.post('/api/report/PreportT2O', authenticateUser, reportController.reportTeam);

/**
 * @swagger
 * /api/report/PreportO2A:
 *   post:
 *     summary: "Report an Organiser"
 *     description: "This endpoint allows a player to report an organiser to an admin."
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

router.post('/api/report/PreportO2A', authenticateUser, reportController.reportOrganiser);

/**
 * @swagger
 * /api/report/OreportO2A:
 *   post:
 *     summary: "Organiser Reports Another Organiser"
 *     description: "This endpoint allows an organiser to report another organiser to an admin."
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               organiserName:
 *                 type: string
 *                 description: "The ID of the organiser being reported."
 *               reason:
 *                 type: string
 *                 description: "Reason for reporting the organiser."
 *             required:
 *               - organiserId
 *               - reason
 *     responses:
 *       "200":
 *         description: "Organiser reported successfully."
 *       "400":
 *         description: "Error reporting the organiser."
 *       "404":
 *         description: "Organiser not found."
 */
router.post('/api/report/OreportO2A', authenticateOrganiser, reportController.reportOrganiser);

/**
 * @swagger
 * /api/report/getTeamReports:
 *   get:
 *     summary: "Get Reported Teams"
 *     description: "This endpoint allows an organiser to get a list of reported teams."
 *     responses:
 *       "200":
 *         description: "List of reported teams."
 *       "404":
 *         description: "No reports found."
 */
router.get('/api/report/getTeamReports', authenticateOrganiser, reportController.getReportedTeams);

/**
 * @swagger
 * /api/report/getOrganiserReports:
 *   get:
 *     summary: "Get Reported Organisers"
 *     description: "This endpoint allows a player to get a list of reported organisers."
 *     responses:
 *       "200":
 *         description: "List of reported organisers."
 *       "404":
 *         description: "No reports found."
 */
router.get('api/report/getOrganiserReports', authenticateUser, reportController.getReportedOrganisers);