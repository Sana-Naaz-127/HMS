const express = require("express");

const {
    getBills,
    getPatientBills,
    createBill,
    updateBillStatus
} = require("../controllers/billingController");

const protect = require("../middleware/authMiddleware");
const authorize = require("../middleware/roleMiddleware");

const router = express.Router();

router.get(
    "/",
    protect,
    authorize("admin", "reception"),
    getBills
);

router.get(
    "/patient/:patientId",
    protect,
    getPatientBills
);

router.post(
    "/",
    protect,
    authorize("admin", "reception"),
    createBill
);

router.patch(
    "/:id/status",
    protect,
    authorize("admin", "reception"),
    updateBillStatus
);

module.exports = router;