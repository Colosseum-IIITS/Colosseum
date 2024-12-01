/**
 * @swagger
 * /player/signin:
 *   post:
 *     summary: "Player SignIn"
 *     description: "This endpoint allows a player to sign in."
 *     parameters:
 *       - in: body
 *         name: player
 *         required: true
 *         schema:
 *           type: object
 *           properties:
 *             email:
 *               type: string
 *             password:
 *               type: string
 *     responses:
 *       "200":
 *         description: "Player signed in successfully."
 *       "400":
 *         description: "Invalid credentials."
 */
router.post('/player/signin', authController.loginPlayer);

/**
 * @swagger
 * /player/signup:
 *   post:
 *     summary: "Player SignUp"
 *     description: "This endpoint allows a player to sign up."
 *     parameters:
 *       - in: body
 *         name: player
 *         required: true
 *         schema:
 *           type: object
 *           properties:
 *             username:
 *               type: string
 *             email:
 *               type: string
 *             password:
 *               type: string
 *     responses:
 *       "200":
 *         description: "Player signed up successfully."
 *       "400":
 *         description: "Invalid input."
 */
router.post('/player/signup', authController.createPlayer);

/**
 * @swagger
 * /org/signin:
 *   post:
 *     summary: "Organiser SignIn"
 *     description: "This endpoint allows an organiser to sign in."
 *     parameters:
 *       - in: body
 *         name: organiser
 *         required: true
 *         schema:
 *           type: object
 *           properties:
 *             email:
 *               type: string
 *             password:
 *               type: string
 *     responses:
 *       "200":
 *         description: "Organiser signed in successfully."
 *       "400":
 *         description: "Invalid credentials."
 */
router.post('/org/signin', authController.loginOrganiser);

/**
 * @swagger
 * /org/signup:
 *   post:
 *     summary: "Organiser SignUp"
 *     description: "This endpoint allows an organiser to sign up."
 *     parameters:
 *       - in: body
 *         name: organiser
 *         required: true
 *         schema:
 *           type: object
 *           properties:
 *             username:
 *               type: string
 *             email:
 *               type: string
 *             password:
 *               type: string
 *     responses:
 *       "200":
 *         description: "Organiser signed up successfully."
 *       "400":
 *         description: "Invalid input."
 */
router.post('/org/signup', authController.createOrganiser);

/**
 * @swagger
 * /admin/create:
 *   post:
 *     summary: "Admin SignUp"
 *     description: "This endpoint allows an admin to sign up."
 *     parameters:
 *       - in: body
 *         name: admin
 *         required: true
 *         schema:
 *           type: object
 *           properties:
 *             username:
 *               type: string
 *             email:
 *               type: string
 *             password:
 *               type: string
 *     responses:
 *       "200":
 *         description: "Admin signed up successfully."
 *       "400":
 *         description: "Invalid input."
 */
router.post('/admin/create', authController.createAdmin);

/**
 * @swagger
 * /admin/login:
 *   post:
 *     summary: "Admin Login"
 *     description: "This endpoint allows an admin to log in."
 *     parameters:
 *       - in: body
 *         name: admin
 *         required: true
 *         schema:
 *           type: object
 *           properties:
 *             email:
 *               type: string
 *             password:
 *               type: string
 *     responses:
 *       "200":
 *         description: "Admin logged in successfully."
 *       "400":
 *         description: "Invalid credentials."
 */
router.post('/admin/login', authController.loginAdmin);
