
/**
 * @swagger
 * tags:
 *   - name: Admin Management
 *     description: Endpoints for administrators to manage organizers, players, tournaments, and view dashboard analytics.
 */

/**
 * @swagger
 * /admin/ban/organiser/{id}:
 *   post:
 *     tags: [Admin Management]
 *     summary: Ban an Organiser
 *     description: Ban an organiser by their ID.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: The ID of the organiser to ban.
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Organiser banned successfully.
 *       400:
 *         description: Invalid ID or error.
 */

/**
 * @swagger
 * /admin/unban/organiser/{id}:
 *   post:
 *     tags: [Admin Management]
 *     summary: Unban an Organiser
 *     description: Unban an organiser by their ID.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: The ID of the organiser to unban.
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Organiser unbanned successfully.
 *       400:
 *         description: Invalid ID or error.
 */

/**
 * @swagger
 * /admin/delete/organiser/{id}:
 *   post:
 *     tags: [Admin Management]
 *     summary: Delete an Organiser
 *     description: Delete an organiser by their ID.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: The ID of the organiser to delete.
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Organiser deleted successfully.
 *       400:
 *         description: Invalid ID or error.
 */

/**
 * @swagger
 * /admin/ban/player/{id}:
 *   post:
 *     tags: [Admin Management]
 *     summary: Ban a Player
 *     description: Ban a player by their ID.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: The ID of the player to ban.
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Player banned successfully.
 *       400:
 *         description: Invalid ID or error.
 */

/**
 * @swagger
 * /admin/unban/player/{id}:
 *   post:
 *     tags: [Admin Management]
 *     summary: Unban a Player
 *     description: Unban a player by their ID.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: The ID of the player to unban.
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Player unbanned successfully.
 *       400:
 *         description: Invalid ID or error.
 */

/**
 * @swagger
 * /admin/approve/tournament/{id}:
 *   post:
 *     tags: [Admin Management]
 *     summary: Approve a Tournament
 *     description: Approve a tournament by its ID.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: The ID of the tournament to approve.
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Tournament approved successfully.
 *       400:
 *         description: Invalid ID or error.
 */

/**
 * @swagger
 * /api/organiser/delete/{tournamentId}:
 *   post:
 *     tags: [Admin Management]
 *     summary: Delete a Tournament
 *     description: Delete a tournament by its ID.
 *     parameters:
 *       - in: path
 *         name: tournamentId
 *         required: true
 *         description: The ID of the tournament to delete.
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Tournament deleted successfully.
 *       400:
 *         description: Invalid tournament ID or error.
 */

/**
 * @swagger
 * /admin/dashboard:
 *   get:
 *     tags: [Admin Management]
 *     summary: Get Admin Dashboard
 *     description: Retrieve dashboard metrics and data for the admin.
 *     responses:
 *       200:
 *         description: Dashboard data retrieved successfully.
 *       400:
 *         description: Unable to retrieve dashboard data.
 */

/**
 * @swagger
 * /admin/banhistory:
 *   get:
 *     tags: [Admin Management]
 *     summary: Get Ban History
 *     description: Retrieve the ban history data.
 *     responses:
 *       200:
 *         description: Ban history retrieved successfully.
 *       400:
 *         description: Unable to retrieve ban history.
 */

// Route handlers
router.post('/admin/ban/organiser/:id', adminController.banOrganiser);
router.post('/admin/unban/organiser/:id', adminController.unBanOrganiser);
router.post('/admin/delete/organiser/:id', adminController.deleteOrganiser);
router.post('/admin/ban/player/:id', adminController.banPlayer);
router.post('/admin/unban/player/:id', adminController.unBanPlayer);
router.post('/admin/approve/tournament/:id', adminController.approveTournament);
router.post('/api/organiser/delete/:tournamentId', authenticateAdmin, organiserController.deleteTournament);
router.get('/admin/dashboard', authenticateAdmin, adminController.getDashboard);
router.get('/admin/banhistory', adminController.getBanHistory);

module.exports = router;
