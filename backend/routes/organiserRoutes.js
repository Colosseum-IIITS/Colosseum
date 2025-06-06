const express = require("express");
const router = express.Router();
const organiserController = require("../controllers/organiserController");
const teamController = require("../controllers/teamControllers");
const reportController = require("../controllers/reportController");
const tournamentController = require("../controllers/tournmentController");
const { authenticateUser, authenticateOrganiser} = require("../middleware/authMiddleware");


// Route to search the Organiser
router.get("/search", organiserController.getOrganiserByUsername);
router.post("/updateUsername",authenticateOrganiser,organiserController.updateUsername);
router.post("/updateEmail",authenticateOrganiser,organiserController.updateEmail);
router.post("/updatePassword",authenticateOrganiser,organiserController.updatePassword);
router.post("/updateDescription",authenticateOrganiser,organiserController.updateDescription);
router.post("/updateProfilePhoto",authenticateOrganiser,organiserController.updateProfilePhoto);
router.get('/UpdateProfile', authenticateOrganiser, (req, res) => {
    res.render('updateOrganiserProfile', { organiser: req.user }); 
});
router.get("/update-visibility", authenticateOrganiser, organiserController.renderUpdateVisibilitySettings);
router.post('/delete/:tournamentId', authenticateOrganiser,organiserController.deleteTournament);
router.get('/:username/dashboard', authenticateUser,organiserController.getOrganiserDashboard);
router.post("/dashboardVisibility",authenticateOrganiser,organiserController.updateVisibilitySettings);
router.post("/banTeam",authenticateOrganiser,organiserController.banTeam);
router.get('/getOrganiserName', authenticateOrganiser, organiserController.getOrganiserName);
router.get("/revenue", authenticateOrganiser, organiserController.getOrganiserRevenue);
router.post('/create', authenticateOrganiser, tournamentController.createTournament);
router.get('/top-organisers', organiserController.getTopOrganisers);
router.get('/tournament-prize-pool-averages', organiserController.getTournamentPrizePoolAverages);

// router.get("/getReports", async(req,res=>{
//     const organiserId = req.body.organiserId;
//     try{
//         const reports = await reportController.fetchTeamReportsForOrganiser(organiserId);
//         res.status(200).json({
//             succes: true,
//             data: reports,
//         });
//     }catch (error){
//         res.status(500).json({
//             success:false,
//             message:eror.message,
//         })
//     }
// }));

module.exports = router;
