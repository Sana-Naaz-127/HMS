const express = require("express");

const {
    getRecords,
    getPatientRecords,
    createRecord,
    updateRecord
} = require("../controllers/recordController");

const protect = require("../middleware/authMiddleware");
const authorize = require("../middleware/roleMiddleware");

const router = express.Router();

router.get(
    "/",
    protect,
    authorize("admin", "doctor", "reception"),
    getRecords
);

router.get(
    "/patient/:patientId",
    protect,
    getPatientRecords
);

router.post(
    "/",
    protect,
    authorize("admin", "doctor"),
    createRecord
);

router.put(
    "/:id",
    protect,
    authorize("admin", "doctor"),
    updateRecord
);

module.exports = router;