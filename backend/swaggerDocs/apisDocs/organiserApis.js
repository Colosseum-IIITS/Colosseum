/**
 * @swagger
 * /api/organiser/search:
 *   get:
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
router.get("/search", organiserController.getOrganiserByUsername);

/**
 * @swagger
 * /api/organiser/updateUsername:
 *   post:
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
router.post("/updateUsername", authenticateOrganiser, organiserController.updateUsername);


/**
 * /**
 * @swagger
 * /api/organiser/updateEmail:
 *   post:
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
router.post("/updateEmail", authenticateOrganiser, organiserController.updateEmail);

/**
 * @swagger
 * /api/organiser/updatePassword:
 *   post:
 *     summary: "Update Organiser Password"
 *     description: "This endpoint allows an organiser to update their password by providing the current password and the new password."
 *     parameters:
 *       - in: body
 *         name: organiser
 *         required: true
 *         schema:
 *           type: object
 *           properties:
 *             currentPassword:
 *               type: string
 *               description: "The current password of the organiser."
 *             newPassword:
 *               type: string
 *               description: "The new password the organiser wants to set."
 *     responses:
 *       "200":
 *         description: "Password updated successfully."
 *       "400":
 *         description: "Incorrect current password or invalid new password."
 *       "500":
 *         description: "Error updating password."
 */
router.post("/updatePassword", authenticateOrganiser, organiserController.updatePassword);

/**
 * @swagger
 * /api/organiser/updateDescription:
 *   post:
 *     summary: "Update Organiser Description"
 *     description: "This endpoint allows an organiser to update their profile description."
 *     parameters:
 *       - in: body
 *         name: organiser
 *         required: true
 *         schema:
 *           type: object
 *           properties:
 *             description:
 *               type: string
 *               description: "The new description of the organiser's profile."
 *     responses:
 *       "200":
 *         description: "Description updated successfully."
 *       "400":
 *         description: "Invalid description format or other error."
 *       "500":
 *         description: "Internal server error."
 */
router.post("/updateDescription", authenticateOrganiser, organiserController.updateDescription);

/**
 * @swagger
 * /api/organiser/updateProfilePhoto:
 *   post:
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
router.get('/:username/dashboard', authenticateUser, organiserController.getOrganiserDashboard);

/**
 * @swagger
 * /api/organiser/dashboardVisibility:
 *   post:
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

/**
 * @swagger
 * /api/organiser/create:
 *   post:
 *     summary: "Create a Tournament"
 *     description: "This endpoint allows an organiser to create a new tournament."
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
 *         description: "Tournament created successfully."
 *       "400":
 *         description: "Invalid tournament data."
 */
router.post('/create', authenticateOrganiser, tournamentController.createTournament);
