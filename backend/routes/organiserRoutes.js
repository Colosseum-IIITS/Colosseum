const express = require("express");
const router = express.Router();
const organiserController = require("../controllers/organiserController");
const teamController = require("../controllers/teamControllers");
const reportController = require("../controllers/reportController");
const { authenticateToken, authenticateOrganiser,authenticateUser} = require("../middleware/authMiddleware");



// Route to search the Organiser
router.get("/search", organiserController.getOrganiserByUsername);
router.post("/updateUsername",authenticateOrganiser,organiserController.updateUsername);
router.post("/updateEmail",authenticateOrganiser,organiserController.updateEmail);
router.post("/updatePassword",authenticateOrganiser,organiserController.updatePassword);
router.post("/updateDescription",authenticateOrganiser,organiserController.updateDescription);
router.post("/updateProfilePhoto",authenticateOrganiser,organiserController.updateProfilePhoto);
router.get('/UpdateProfile', authenticateOrganiser, (req, res) => {
    res.render('updateOrganiserProfile', { organiser: req.user });  // Assuming req.user contains organiser data
});
router.get("/update-visibility", authenticateOrganiser, organiserController.renderUpdateVisibilitySettings);
router.get('/:username/dashboard', authenticateUser,organiserController.getOrganiserDashboard);
router.post("/dashboardVisibility",authenticateOrganiser,organiserController.updateVisibilitySettings);
router.post("/banTeam",authenticateOrganiser,organiserController.banTeam);


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
