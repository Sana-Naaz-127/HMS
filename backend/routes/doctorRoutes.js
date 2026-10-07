const express = require("express");

const {
    getDoctors,
    getDoctor,
    markLeave
} = require("../controllers/doctorController");

const protect = require("../middleware/authMiddleware");
const authorize = require("../middleware/roleMiddleware");

const router = express.Router();


router.get(
    "/",
    protect,
    getDoctors
);


router.get(
    "/:id",
    protect,
    getDoctor
);


router.post(
    "/:id/leave",
    protect,
    authorize("admin"),
    markLeave
);


module.exports = router;