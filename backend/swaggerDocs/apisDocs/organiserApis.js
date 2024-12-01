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
 * /organiser/updateUsername:
 *   post:
 *     summary: "Update Organiser Username"
 *     description: "This endpoint allows an organiser to update their username."
 *     parameters:
 *       - in: body
 *         name: organiser
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
 *         description: "Invalid input or error."
 */
router.post("/updateUsername", authenticateOrganiser, organiserController.updateUsername);

/**
 * @swagger
 * /organiser/updateEmail:
 *   post:
 *     summary: "Update Organiser Email"
 *     description: "This endpoint allows an organiser to update their email."
 *     parameters:
 *       - in: body
 *         name: organiser
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
router.post("/updateEmail", authenticateOrganiser, organiserController.updateEmail);

/**
 * @swagger
 * /organiser/updatePassword:
 *   post:
 *     summary: "Update Organiser Password"
 *     description: "This endpoint allows an organiser to update their password."
 *     parameters:
 *       - in: body
 *         name: organiser
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
router.post("/updatePassword", authenticateOrganiser, organiserController.updatePassword);

/**
 * @swagger
 * /organiser/updateDescription:
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
 *     responses:
 *       "200":
 *         description: "Description updated successfully."
 *       "400":
 *         description: "Invalid description format or other error."
 */
router.post("/updateDescription", authenticateOrganiser, organiserController.updateDescription);

/**
 * @swagger
 * /organiser/updateProfilePhoto:
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
 * /organiser/update-visibility:
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
 * /organiser/dashboard:
 *   get:
 *     summary: "Get Organiser Dashboard"
 *     description: "This endpoint allows an organiser to view their dashboard."
 *     parameters:
 *       - in: query
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
 * /organiser/dashboardVisibility:
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
 * /organiser/banTeam:
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

