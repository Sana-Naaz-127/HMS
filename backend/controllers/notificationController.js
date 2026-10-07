const Notification = require("../models/Notification");

const getNotifications = async (req, res) => {
    try {
        const notifications =
            await Notification.find({
                user: req.user._id
            }).sort({ createdAt: -1 });

        res.json({
            success: true,
            notifications
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to fetch notifications."
        });
    }
};

const createNotification = async (req, res) => {
    try {
        const {
            user,
            title,
            message,
            type
        } = req.body;

        if (!user || !title || !message) {
            return res.status(400).json({
                success: false,
                message: "User, title and message are required."
            });
        }

        const notification =
            await Notification.create({
                user,
                title,
                message,
                type
            });

        res.status(201).json({
            success: true,
            message: "Notification created.",
            notification
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to create notification."
        });
    }
};

const markAsRead = async (req, res) => {
    try {
        const notification =
            await Notification.findOneAndUpdate(
                {
                    _id: req.params.id,
                    user: req.user._id
                },
                {
                    read: true
                },
                {
                    new: true
                }
            );

        if (!notification) {
            return res.status(404).json({
                success: false,
                message: "Notification not found."
            });
        }

        res.json({
            success: true,
            message: "Notification marked as read.",
            notification
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to update notification."
        });
    }
};

module.exports = {
    getNotifications,
    createNotification,
    markAsRead
};