const express = require("express");

const {
    getAppointments,
    getAppointment,
    createAppointment,
    updateAppointmentStatus,
    deleteAppointment
} = require("../controllers/appointmentController");

const protect = require("../middleware/authMiddleware");
const authorize = require("../middleware/roleMiddleware");

const router = express.Router();

router.get(
    "/",
    protect,
    getAppointments
);

router.get(
    "/:id",
    protect,
    getAppointment
);

router.post(
    "/",
    protect,
    authorize("admin", "reception", "patient"),
    createAppointment
);

router.patch(
    "/:id/status",
    protect,
    authorize("admin", "doctor", "reception"),
    updateAppointmentStatus
);

router.delete(
    "/:id",
    protect,
    authorize("admin", "reception"),
    deleteAppointment
);

module.exports = router;