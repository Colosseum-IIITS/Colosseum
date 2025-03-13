/**
 * @swagger
 * tags:
 *   name: Organiser
 *   description: Organiser-related operations
 */

/**
 * @swagger
 * /api/organiser/search:
 *   get:
 *     summary: Search for an organiser
 *     description: Retrieve an organiser's details by their username.
 *     tags: [Organiser]
 *     parameters:
 *       - in: query
 *         name: username
 *         schema:
 *           type: string
 *         required: true
 *         description: The username of the organiser to search for.
 *     responses:
 *       200:
 *         description: Organiser found successfully.
 *       404:
 *         description: Organiser not found.
 */
router.get("/search", organiserController.getOrganiserByUsername);

/**
 * @swagger
 * /api/organiser/updateUsername:
 *   post:
 *     summary: Update organiser username
 *     description: Allows an organiser to update their username.
 *     tags: [Organiser]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               newUsername:
 *                 type: string
 *     responses:
 *       200:
 *         description: Username updated successfully.
 *       400:
 *         description: Invalid input or error.
 */
router.post("/updateUsername", authenticateOrganiser, organiserController.updateUsername);

/**
 * @swagger
 * /api/organiser/updateEmail:
 *   post:
 *     summary: Update organiser email
 *     description: Allows an organiser to update their email.
 *     tags: [Organiser]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               newEmail:
 *                 type: string
 *                 format: email
 *     responses:
 *       200:
 *         description: Email updated successfully.
 *       400:
 *         description: Invalid email format or other error.
 */
router.post("/updateEmail", authenticateOrganiser, organiserController.updateEmail);

/**
 * @swagger
 * /api/organiser/updatePassword:
 *   post:
 *     summary: Update organiser password
 *     description: Allows an organiser to update their password by providing the current password and the new password.
 *     tags: [Organiser]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               currentPassword:
 *                 type: string
 *                 description: The current password of the organiser.
 *               newPassword:
 *                 type: string
 *                 description: The new password the organiser wants to set.
 *     responses:
 *       200:
 *         description: Password updated successfully.
 *       400:
 *         description: Incorrect current password or invalid new password.
 *       500:
 *         description: Error updating password.
 */
router.post("/updatePassword", authenticateOrganiser, organiserController.updatePassword);

/**
 * @swagger
 * /api/organiser/updateProfilePhoto:
 *   post:
 *     summary: Update organiser profile photo
 *     description: Allows an organiser to update their profile photo.
 *     tags: [Organiser]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               profilePhoto:
 *                 type: string
 *                 description: URL of the new profile photo.
 *     responses:
 *       200:
 *         description: Profile photo updated successfully.
 *       400:
 *         description: Invalid image format or other error.
 */
router.post("/updateProfilePhoto", authenticateOrganiser, organiserController.updateProfilePhoto);

/**
 * @swagger
 * /api/organiser/{username}/dashboard:
 *   get:
 *     summary: Get organiser dashboard
 *     description: Retrieve dashboard details for a specific organiser.
 *     tags: [Organiser]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: username
 *         schema:
 *           type: string
 *         required: true
 *         description: The username of the organiser.
 *     responses:
 *       200:
 *         description: Organiser dashboard data retrieved successfully.
 *       404:
 *         description: Organiser not found.
 */
router.get("/:username/dashboard", authenticateUser, organiserController.getOrganiserDashboard);

/**
 * @swagger
 * /api/organiser/dashboardVisibility:
 *   post:
 *     summary: Update organiser dashboard visibility
 *     description: Allows an organiser to update the visibility of dashboard components.
 *     tags: [Organiser]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               descriptionVisible:
 *                 type: boolean
 *               profilePhotoVisible:
 *                 type: boolean
 *               prizePoolVisible:
 *                 type: boolean
 *               tournamentsVisible:
 *                 type: boolean
 *               followersVisible:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Visibility settings updated successfully.
 *       400:
 *         description: Invalid input or other error.
 */
router.post("/dashboardVisibility", authenticateOrganiser, organiserController.updateVisibilitySettings);

/**
 * @swagger
 * /api/organiser/revenue:
 *   get:
 *     summary: Get organiser revenue
 *     description: Retrieves revenue details for an organiser.
 *     tags: [Organiser]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Revenue details retrieved successfully.
 *       400:
 *         description: Error retrieving revenue.
 */
router.get("/revenue", authenticateOrganiser, organiserController.getOrganiserRevenue);

/**
 * @swagger
 * /api/organiser/create:
 *   post:
 *     summary: Create a tournament
 *     description: Allows an organiser to create a new tournament.
 *     tags: [Organiser]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               tournamentName:
 *                 type: string
 *               startDate:
 *                 type: string
 *                 format: date-time
 *               endDate:
 *                 type: string
 *                 format: date-time
 *     responses:
 *       201:
 *         description: Tournament created successfully.
 *       400:
 *         description: Invalid input or error.
 */
router.post("/create", authenticateOrganiser, tournamentController.createTournament);

module.exports = router;
