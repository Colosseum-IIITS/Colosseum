const express = require("express");
const router = express.Router();
const organiserController = require("../controllers/organiserController");
const teamController = require("../controllers/teamControllers");
const reportController = require("../controllers/reportController");
const { authenticateToken } = require("../middleware/authMiddleware");



// Route to search the Organiser
router.get("/search", organiserController.getOrganiserByUsername);

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
