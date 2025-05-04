/**
 * @swagger
 * tags:
 *   name: Admin
 *   description: API endpoints for admin operations
 */

/**
 * @swagger
 * /admin/ban/organiser/{id}:
 *   post:
 *     tags: [Admin]
 *     summary: "Ban an Organiser"
 *     description: "This endpoint allows an admin to ban an organiser by ID."
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: "The ID of the organiser to be banned."
 *     responses:
 *       "200":
 *         description: "Organiser banned successfully."
 *       "400":
 *         description: "Invalid ID or other error."
 */
router.post('/ban/organiser/:id', adminController.banOrganiser);

/**
 * @swagger
 * /admin/unban/organiser/{id}:
 *   post:
 *     tags: [Admin]
 *     summary: "Unban an Organiser"
 *     description: "This endpoint allows an admin to unban an organiser by ID."
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: "The ID of the organiser to be unbanned."
 *     responses:
 *       "200":
 *         description: "Organiser unbanned successfully."
 *       "400":
 *         description: "Invalid ID or other error."
 */
router.post('/unban/organiser/:id', adminController.unBanOrganiser);

/**
 * @swagger
 * /admin/delete/organiser/{id}:
 *   post:
 *     tags: [Admin]
 *     summary: "Delete an Organiser"
 *     description: "This endpoint allows an admin to delete an organiser by ID."
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: "The ID of the organiser to be deleted."
 *     responses:
 *       "200":
 *         description: "Organiser deleted successfully."
 *       "400":
 *         description: "Invalid ID or other error."
 */
router.post('/delete/organiser/:id', adminController.deleteOrganiser);

/**
 * @swagger
 * /admin/ban/player/{id}:
 *   post:
 *     tags: [Admin]
 *     summary: "Ban a Player"
 *     description: "This endpoint allows an admin to ban a player by ID."
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: "The ID of the player to be banned."
 *     responses:
 *       "200":
 *         description: "Player banned successfully."
 *       "400":
 *         description: "Invalid ID or other error."
 */
router.post('/ban/player/:id', adminController.banPlayer);

/**
 * @swagger
 * /admin/unban/player/{id}:
 *   post:
 *     tags: [Admin]
 *     summary: "Unban a Player"
 *     description: "This endpoint allows an admin to unban a player by ID."
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: "The ID of the player to be unbanned."
 *     responses:
 *       "200":
 *         description: "Player unbanned successfully."
 *       "400":
 *         description: "Invalid ID or other error."
 */
router.post('/unban/player/:id', adminController.unBanPlayer);

/**
 * @swagger
 * /admin/approve/tournament/{id}:
 *   post:
 *     tags: [Admin]
 *     summary: "Approve a Tournament"
 *     description: "This endpoint allows an admin to approve a tournament by ID."
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: "The ID of the tournament to be approved."
 *     responses:
 *       "200":
 *         description: "Tournament approved successfully."
 *       "400":
 *         description: "Invalid ID or other error."
 */
router.post('/approve/tournament/:id', adminController.approveTournament);

/**
 * @swagger
 * /api/organiser/delete/{tournamentId}:
 *   post:
 *     tags: [Admin]
 *     summary: "Delete a Tournament"
 *     description: "This endpoint allows an admin to delete a tournament by ID."
 *     parameters:
 *       - in: path
 *         name: tournamentId
 *         required: true
 *         schema:
 *           type: string
 *         description: "The ID of the tournament to be deleted."
 *     responses:
 *       "200":
 *         description: "Tournament deleted successfully."
 *       "400":
 *         description: "Invalid tournament ID or other error."
 */
router.post('/api/organiser/delete/:tournamentId', authenticateAdmin, organiserController.deleteTournament);

/**
 * @swagger
 * /admin/dashboard:
 *   get:
 *     tags: [Admin]
 *     summary: "Get Admin Dashboard"
 *     description: "This endpoint returns the dashboard for the admin, showing key metrics and actions."
 *     responses:
 *       "200":
 *         description: "Dashboard data retrieved successfully."
 *       "400":
 *         description: "Error retrieving dashboard data."
 */
router.get('/dashboard', authenticateAdmin, adminController.getDashboard);

/**
 * @swagger
 * /admin/banhistory:
 *   get:
 *     tags: [Admin]
 *     summary: "Get ban history"
 *     description: "This endpoint returns the ban history within the last month"
 *     responses:
 *       "200":
 *         description: "Ban data retrieved successfully."
 *       "400":
 *         description: "Error retrieving Ban data."
 */
router.get('/banhistory', adminController.getBanHistory);