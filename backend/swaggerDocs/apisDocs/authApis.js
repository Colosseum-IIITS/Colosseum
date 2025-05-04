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
 * /auth/admin/create:
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
 *         description: "Admin signed up successfully."
 *       "400":
 *         description: "Invalid input."
 *       "500":
 *         description: "Internal Server Error"
 */
router.post('/auth/admin/create', authController.createAdmin);

/**
 * @swagger
 * /auth/admin/login:
 *   post:
 *     tags: [Authentication]
 *     summary: "Admin Login"
 *     description: "This endpoint allows an admin to log in."
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
 *         description: "Admin logged in successfully."
 *       "400":
 *         description: "Invalid credentials."
 */
router.post('/auth/admin/login', authController.loginAdmin);