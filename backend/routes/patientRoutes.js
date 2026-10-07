const express = require("express");

const {
    getPatients,
    getPatient,
    createPatient,
    updatePatient,
    updatePatientStatus
} = require("../controllers/patientController");

const protect = require("../middleware/authMiddleware");
const authorize = require("../middleware/roleMiddleware");

const router = express.Router();

router.get(
    "/",
    protect,
    authorize("admin", "doctor", "reception"),
    getPatients
);

router.get(
    "/:id",
    protect,
    getPatient
);

router.post(
    "/",
    protect,
    authorize("admin", "reception"),
    createPatient
);

router.put(
    "/:id",
    protect,
    authorize("admin", "reception"),
    updatePatient
);

router.patch(
    "/:id/status",
    protect,
    authorize("admin", "reception"),
    updatePatientStatus
);

module.exports = router;