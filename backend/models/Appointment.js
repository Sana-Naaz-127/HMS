const mongoose = require("mongoose");

const appointmentSchema = new mongoose.Schema(
    {
        appointmentId: {
            type: String,
            unique: true,
            required: true
        },

        patient: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Patient",
            required: true
        },

        doctor: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Doctor",
            required: true
        },

        date: {
            type: String,
            required: true
        },

        time: {
            type: String,
            required: true
        },

        reason: {
            type: String,
            default: ""
        },

        status: {
            type: String,
            enum: [
                "Scheduled",
                "Completed",
                "Cancelled",
                "No Show"
            ],
            default: "Scheduled"
        },

        notes: {
            type: String,
            default: ""
        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model("Appointment", appointmentSchema);