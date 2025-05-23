/**
 * @swagger
 * tags:
 *   name: Organisers
 *   description: API endpoints for organiser operations
 */

/**
 * @swagger
 * /api/organiser/search:
 *   get:
 *     tags: [Organisers]
 *     summary: "Search an Organiser"
 *     description: "This endpoint allows searching an organiser by their username."
 *     parameters:
 *       - in: query
 *         name: username
 *         required: true
 *         schema:
 *           type: string
 *         description: "The username of the organiser to search for."
 *     responses:
 *       "200":
 *         description: "Organiser found successfully."
 *       "404":
 *         description: "Organiser not found."
 */
router.get("/api/organiser/search", organiserController.getOrganiserByUsername);

/**
 * @swagger
 * /api/organiser/updateUsername:
 *   post:
 *     tags: [Organisers]
 *     summary: "Update Organiser Username"
 *     description: "This endpoint allows an organiser to update their username."
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
 *       "200":
 *         description: "Username updated successfully."
 *       "400":
 *         description: "Invalid input or error."
 */
router.post("/api/organiser/updateUsername", authenticateOrganiser, organiserController.updateUsername);


/**
 * @swagger
 * /api/organiser/updateEmail:
 *   post:
 *     tags: [Organisers]
 *     summary: "Update Organiser Email"
 *     description: "This endpoint allows an organiser to update their email."
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
 *       "200":
 *         description: "Email updated successfully."
 *       "400":
 *         description: "Invalid email format or other error."
 */
router.post("/api/organiser/updateEmail", authenticateOrganiser, organiserController.updateEmail);

/**
 * @swagger
 * /api/organiser/updatePassword:
 *   post:
 *     tags: [Organisers]
 *     summary: "Update Organiser Password"
 *     description: "This endpoint allows an organiser to update their password by providing the current password and the new password."
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               currentPassword:
 *                 type: string
 *                 description: "The current password of the organiser."
 *               newPassword:
 *                 type: string
 *                 description: "The new password the organiser wants to set."
 *     responses:
 *       "200":
 *         description: "Password updated successfully."
 *       "400":
 *         description: "Incorrect current password or invalid new password."
 *       "500":
 *         description: "Error updating password."
 */

router.post("/api/organiser/updatePassword", authenticateOrganiser, organiserController.updatePassword);

/**
 * @swagger
 * /api/organiser/updateDescription:
 *   post:
 *     tags: [Organisers]
 *     summary: "Update Organiser Description"
 *     description: "This endpoint allows an organiser to update their profile description."
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               newDescription:
 *                 type: string
 *                 description: "The new description of the organiser."
 *     responses:
 *       "200":
 *         description: "Description updated successfully."
 *       "400":
 *         description: "Invalid description format or other error."
 *       "500":
 *         description: "Internal server error."
 */
router.post("/api/organiser/updateDescription", authenticateOrganiser, organiserController.updateDescription);

/**
 * @swagger
 * /api/organiser/updateProfilePhoto:
 *   post:
 *     tags: [Organisers]
 *     summary: "Update Organiser Profile Photo"
 *     description: "This endpoint allows an organiser to update their profile photo."
 *     parameters:
 *       - in: body
 *         name: profilePhoto
 *         required: true
 *         schema:
 *           type: object
 *           properties:
 *             profilePhoto:
 *               type: string
 *               description: "URL of the new profile photo."
 *     responses:
 *       "200":
 *         description: "Profile photo updated successfully."
 *       "400":
 *         description: "Invalid image format or other error."
 */
router.post("/updateProfilePhoto", authenticateOrganiser, organiserController.updateProfilePhoto);

/**
 * @swagger
 * /api/organiser/update-visibility:
 *   get:
 *     tags: [Organisers]
 *     summary: "Update Organiser Visibility Settings"
 *     description: "This endpoint allows an organiser to manage their visibility settings."
 *     responses:
 *       "200":
 *         description: "Visibility settings retrieved successfully."
 *       "400":
 *         description: "Error retrieving visibility settings."
 */
router.get('/update-visibility', authenticateOrganiser, organiserController.renderUpdateVisibilitySettings);

/**
 * @swagger
 * /api/organiser/{username}/dashboard:
 *   get:
 *     tags: [Organisers]
 *     summary: "Get Organiser Dashboard"
 *     description: "This endpoint allows an organiser to view their dashboard."
 *     parameters:
 *       - in: path
 *         name: username
 *         required: true
 *         schema:
 *           type: string
 *         description: "The username of the organiser."
 *     responses:
 *       "200":
 *         description: "Organiser dashboard data retrieved successfully."
 *       "404":
 *         description: "Organiser not found."
 */
router.get('/api/organiser/:username/dashboard', authenticateUser, organiserController.getOrganiserDashboard);

/**
 * @swagger
 * /api/organiser/dashboardVisibility:
 *   post:
 *     tags: [Organisers]
 *     summary: "Update Organiser Dashboard Visibility"
 *     description: "This endpoint allows an organiser to update their dashboard visibility settings."
 *     parameters:
 *       - in: body
 *         name: visibility
 *         required: true
 *         schema:
 *           type: object
 *           properties:
 *             descriptionVisible:
 *               type: boolean
 *             profilePhotoVisible:
 *               type: boolean
 *             prizePoolVisible:
 *               type: boolean
 *             tournamentsVisible:
 *               type: boolean
 *             followersVisible:
 *               type: boolean
 *     responses:
 *       "200":
 *         description: "Dashboard visibility updated successfully."
 *       "400":
 *         description: "Invalid visibility settings or other error."
 */
router.post("/dashboardVisibility", authenticateOrganiser, organiserController.updateVisibilitySettings);

/**
 * @swagger
 * /api/organiser/banTeam:
 *   post:
 *     tags: [Organisers]
 *     summary: "Ban a Team"
 *     description: "This endpoint allows an organiser to ban a team from participating in their tournaments."
 *     parameters:
 *       - in: body
 *         name: team
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
 *         description: "Team banned successfully."
 *       "400":
 *         description: "Invalid team ID or other error."
 */
router.post("/banTeam", authenticateOrganiser, organiserController.banTeam);