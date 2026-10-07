const mongoose = require("mongoose");

const medicalRecordSchema = new mongoose.Schema(
    {
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

        appointment: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Appointment",
            default: null
        },

        diagnosis: {
            type: String,
            required: true
        },

        symptoms: {
            type: String,
            default: ""
        },

        prescription: {
            type: String,
            default: ""
        },

        notes: {
            type: String,
            default: ""
        },

        recordDate: {
            type: String,
            required: true
        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model(
    "MedicalRecord",
    medicalRecordSchema
);