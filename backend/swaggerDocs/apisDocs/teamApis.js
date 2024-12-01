/**
 * @swagger
 * /team/create:
 *   post:
 *     summary: "Create a Team"
 *     description: "This endpoint allows a player to create a new team."
 *     parameters:
 *       - in: body
 *         name: team
 *         required: true
 *         schema:
 *           type: object
 *           properties:
 *             name:
 *               type: string
 *             logo:
 *               type: string
 *               description: "URL of the team logo."
 *             players:
 *               type: array
 *               items:
 *                 type: string
 *               description: "List of player IDs in the team."
 *             captain:
 *               type: string
 *               description: "ID of the team captain."
 *     responses:
 *       "200":
 *         description: "Team created successfully."
 *       "400":
 *         description: "Invalid team data."
 */
router.post('/create', authenticateUser, teamController.createTeam);

/**
 * @swagger
 * /team/join:
 *   post:
 *     summary: "Join a Team"
 *     description: "This endpoint allows a player to join an existing team."
 *     parameters:
 *       - in: body
 *         name: teamId
 *         required: true
 *         schema:
 *           type: object
 *           properties:
 *             teamId:
 *               type: string
 *               description: "The ID of the team to join."
 *     responses:
 *       "200":
 *         description: "Player joined the team successfully."
 *       "400":
 *         description: "Error joining the team."
 */
router.post('/join', authenticateUser, teamController.joinTeam);

/**
 * @swagger
 * /team/request:
 *   post:
 *     summary: "Request to Join a Team"
 *     description: "This endpoint allows a player to request to join an existing team."
 *     parameters:
 *       - in: body
 *         name: teamId
 *         required: true
 *         schema:
 *           type: object
 *           properties:
 *             teamId:
 *               type: string
 *               description: "The ID of the team to request joining."
 *     responses:
 *       "200":
 *         description: "Join request sent successfully."
 *       "400":
 *         description: "Error sending join request."
 */
router.post('/request', authenticateUser, teamController.requestToJoinTeam);

/**
 * @swagger
 * /team/leave:
 *   post:
 *     summary: "Leave a Team"
 *     description: "This endpoint allows a player to leave a team they are currently part of."
 *     parameters:
 *       - in: body
 *         name: teamId
 *         required: true
 *         schema:
 *           type: object
 *           properties:
 *             teamId:
 *               type: string
 *               description: "The ID of the team the player is leaving."
 *     responses:
 *       "200":
 *         description: "Player left the team successfully."
 *       "400":
 *         description: "Error leaving the team."
 */
router.post('/leave', authenticateUser, teamController.leaveTeam);

/**
 * @swagger
 * /team/search:
 *   get:
 *     summary: "Search for Teams"
 *     description: "This endpoint allows a player to search for teams by name."
 *     parameters:
 *       - in: query
 *         name: teamName
 *         required: false
 *         schema:
 *           type: string
 *         description: "The name of the team to search for."
 *     responses:
 *       "200":
 *         description: "Teams found successfully."
 *       "404":
 *         description: "No teams found."
 */
router.get('/search', teamController.getTeamsByName);

/**
 * @swagger
 * /team/updateTeamName:
 *   post:
 *     summary: "Update Team Name"
 *     description: "This endpoint allows the team captain to update the team name."
 *     parameters:
 *       - in: body
 *         name: teamName
 *         required: true
 *         schema:
 *           type: object
 *           properties:
 *             teamName:
 *               type: string
 *               description: "The new name of the team."
 *     responses:
 *       "200":
 *         description: "Team name updated successfully."
 *       "400":
 *         description: "Error updating team name."
 */
router.post('/updateTeamName', authenticateUser, teamController.updateTeamName);

/**
 * @swagger
 * /team/{teamId}/requests:
 *   get:
 *     summary: "Get Join Requests for a Team"
 *     description: "This endpoint allows the team captain to view join requests for their team."
 *     parameters:
 *       - in: path
 *         name: teamId
 *         required: true
 *         schema:
 *           type: string
 *         description: "The ID of the team to get join requests for."
 *     responses:
 *       "200":
 *         description: "Join requests retrieved successfully."
 *       "404":
 *         description: "No join requests found."
 */
router.get('/:teamId/requests', authenticateUser, teamController.getJoinRequests);

/**
 * @swagger
 * /team/accept:
 *   post:
 *     summary: "Accept a Join Request"
 *     description: "This endpoint allows the captain to accept a join request for their team."
 *     parameters:
 *       - in: body
 *         name: joinRequest
 *         required: true
 *         schema:
 *           type: object
 *           properties:
 *             playerId:
 *               type: string
 *               description: "ID of the player requesting to join the team."
 *     responses:
 *       "200":
 *         description: "Join request accepted successfully."
 *       "400":
 *         description: "Error accepting join request."
 */
router.post('/accept', authenticateUser, teamController.acceptJoinRequest);

/**
 * @swagger
 * /team/reject:
 *   post:
 *     summary: "Reject a Join Request"
 *     description: "This endpoint allows the captain to reject a join request for their team."
 *     parameters:
 *       - in: body
 *         name: joinRequest
 *         required: true
 *         schema:
 *           type: object
 *           properties:
 *             playerId:
 *               type: string
 *               description: "ID of the player requesting to join the team."
 *     responses:
 *       "200":
 *         description: "Join request rejected successfully."
 *       "400":
 *         description: "Error rejecting join request."
 */
router.post('/reject', authenticateUser, teamController.rejectJoinRequest);
