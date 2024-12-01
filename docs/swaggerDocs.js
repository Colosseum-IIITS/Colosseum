/**
 * @swagger
 * components:
 *   schemas:
 *     Team:
 *       type: object
 *       required:
 *         - name
 *       properties:
 *         name:
 *           type: string
 *           description: The name of the team
 *         captain:
 *           type: string
 *           description: The ID of the team's captain
 *         players:
 *           type: array
 *           items:
 *             type: string
 *           description: List of player IDs in the team
 */
