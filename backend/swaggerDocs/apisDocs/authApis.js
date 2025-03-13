/**
 * @swagger
 * tags:
 *   - name: Authentication
 *     description: Authentication endpoints for players, Organisers, and administrators
 */

/**
 * @swagger
 * /auth/player/signin:
 *   post:
 *     tags: [Authentication]
 *     summary: Player SignIn
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LoginCredentials'
 *     responses:
 *       200:
 *         description: Player signed in successfully
 *       400:
 *         description: Invalid credentials
 */

/**
 * @swagger
 * /auth/player/signup:
 *   post:
 *     tags: [Authentication]
 *     summary: Player SignUp
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/SignUpCredentials'
 *     responses:
 *       201:
 *         description: Player registered successfully
 *       400:
 *         description: Invalid input
 */

/**
 * @swagger
 * /auth/org/signin:
 *   post:
 *     tags: [Authentication]
 *     summary: Organizer SignIn
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LoginCredentials'
 *     responses:
 *       200:
 *         description: Organizer signed in successfully
 *       400:
 *         description: Invalid credentials
 */

/**
 * @swagger
 * /auth/org/signup:
 *   post:
 *     tags: [Authentication]
 *     summary: Organizer SignUp
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/SignUpCredentials'
 *     responses:
 *       201:
 *         description: Organizer registered successfully
 *       400:
 *         description: Invalid input
 */

/**
 * @swagger
 * /auth/admin/create:
 *   post:
 *     tags: [Authentication]
 *     summary: Admin SignUp
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/SignUpCredentials'
 *     responses:
 *       201:
 *         description: Admin registered successfully
 *       400:
 *         description: Invalid input
 */

/**
 * @swagger
 * /auth/admin/login:
 *   post:
 *     tags: [Authentication]
 *     summary: Admin SignIn
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LoginCredentials'
 *     responses:
 *       200:
 *         description: Admin signed in successfully
 *       400:
 *         description: Invalid credentials
 */

// Route handlers
router.post('/auth/player/signin', authController.loginPlayer);
router.post('/auth/player/signup', authController.createPlayer);
router.post('/auth/org/signin', authController.loginOrganiser);
router.post('/auth/org/signup', authController.createOrganiser);
router.post('/auth/admin/create', authController.createAdmin);
router.post('/auth/admin/login', authController.loginAdmin);

module.exports = router;
