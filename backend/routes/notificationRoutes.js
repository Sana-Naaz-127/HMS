const express = require("express");

const {
    getNotifications,
    createNotification,
    markAsRead
} = require("../controllers/notificationController");

const protect = require("../middleware/authMiddleware");
const authorize = require("../middleware/roleMiddleware");

const router = express.Router();

router.get(
    "/",
    protect,
    getNotifications
);

router.post(
    "/",
    protect,
    authorize("admin"),
    createNotification
);

router.patch(
    "/:id/read",
    protect,
    markAsRead
);

module.exports = router;