/**
 * @swagger
 * tags:
 *   name: Authentication
 *   description: API endpoints for user authentication
 */

/**
 * @swagger
 * /auth/player/signin:
 *   post:
 *     tags: [Authentication]
 *     summary: "Player SignIn"
 *     description: "This endpoint allows a player to sign in."
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *               password:
 *                 type: string
 *             required:
 *               - username
 *               - password
 *     responses:
 *       "200":
 *         description: "Player signed in successfully."
 *       "400":
 *         description: "Invalid credentials."
 */
router.post('/auth/player/signin', authController.loginPlayer);

/**
 * @swagger
 * /auth/player/signup:
 *   post:
 *     tags: [Authentication]
 *     summary: "Player SignUp"
 *     description: "This endpoint allows a player to sign up."
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *             required:
 *               - username
 *               - email
 *               - password
 *     responses:
 *       "201":
 *         description: "Player signed up successfully."
 *       "400":
 *         description: "Invalid input."
 *       "500":
 *         description: "Internal Server Error"
 */
router.post('/auth/player/signup', authController.createPlayer);

/**
 * @swagger
 * /auth/org/signin:
 *   post:
 *     tags: [Authentication]
 *     summary: "Organiser SignIn"
 *     description: "This endpoint allows an organiser to sign in."
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *               password:
 *                 type: string
 *             required:
 *               - username
 *               - password
 *     responses:
 *       "200":
 *         description: "Organiser signed in successfully."
 *       "400":
 *         description: "Invalid credentials."
 */
router.post('/auth/org/signin', authController.loginOrganiser);

/**
 * @swagger
 * /auth/org/signup:
 *   post:
 *     tags: [Authentication]
 *     summary: "Organiser SignUp"
 *     description: "This endpoint allows an organiser to sign up."
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *             required:
 *               - username
 *               - email
 *               - password
 *     responses:
 *       "201":
 *         description: "Organiser signed up successfully."
 *       "400":
 *         description: "Invalid input."
 *       "500":
 *         description: "Internal Server Error"
 */
router.post('/auth/org/signup', authController.createOrganiser);

/**
 * @swagger
 * /auth/admin/signup:
 *   post:
 *     tags: [Authentication]
 *     summary: "Admin SignUp"
 *     description: "This endpoint allows an admin to sign up."
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *                 example: "admin123"
 *               email:
 *                 type: string
 *                 example: "admin@example.com"
 *               password:
 *                 type: string
 *                 example: "adminpass123"
 *             required:
 *               - username
 *               - email
 *               - password
 *     responses:
 *       "201":
 *         description: "Admin signed up successfully."
 *       "400":
 *         description: "Invalid input."
 *       "500":
 *         description: "Internal Server Error"
 */
router.post('/auth/admin/signup', authController.createAdmin);

/**
 * @swagger
 * /auth/admin/signin:
 *   post:
 *     tags: [Authentication]
 *     summary: "Admin SignIn"
 *     description: "This endpoint allows an admin to sign in"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *                 example: "admin123"
 *               password:
 *                 type: string
 *                 example: "adminpass123"
 *             required:
 *               - username
 *               - password
 *     responses:
 *       200:
 *         description: Successfully signed in
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Login successful"
 *                 token:
 *                   type: string
 *       401:
 *         description: Invalid credentials
 *       500:
 *         description: Server error
 */
router.post('/auth/admin/signin', authController.loginAdmin);