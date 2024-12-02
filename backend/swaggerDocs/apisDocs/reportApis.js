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
router.post('/api/report/PreportT2O', authenticateUser, reportController.reportTeam);


/**
 * @swagger
 * /report/PreportO2A:
 *   post:
 *     summary: "Report an Organiser"
 *     description: "This endpoint allows a player to report an organiser to an admin."
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
router.post('/PreportO2A', authenticateUser, reportController.reportOrganiser);

/**
 * @swagger
 * /report/OreportO2A:
 *   post:
 *     summary: "Organiser Report an Organiser"
 *     description: "This endpoint allows an organiser to report another organiser to an admin."
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
router.post('/OreportO2A', authenticateOrganiser, reportController.reportOrganiser);

/**
 * @swagger
 * /report/getTeamReports:
 *   get:
 *     summary: "Get Reported Teams"
 *     description: "This endpoint allows an organiser to get a list of reported teams."
 *     responses:
 *       "200":
 *         description: "List of reported teams."
 *       "404":
 *         description: "No reports found."
 */
router.get('/getTeamReports', authenticateOrganiser, reportController.getReportedTeams);

/**
 * @swagger
 * /report/getOrganiserReports:
 *   get:
 *     summary: "Get Reported Organisers"
 *     description: "This endpoint allows a player to get a list of reported organisers."
 *     responses:
 *       "200":
 *         description: "List of reported organisers."
 *       "404":
 *         description: "No reports found."
 */
router.get('/getOrganiserReports', authenticateUser, reportController.getReportedOrganisers);
