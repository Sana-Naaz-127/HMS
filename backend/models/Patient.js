const mongoose = require("mongoose");

const patientSchema = new mongoose.Schema(
    {
        patientId: {
            type: String,
            unique: true,
            required: true
        },

        name: {
            type: String,
            required: true,
            trim: true
        },

        age: {
            type: Number,
            required: true,
            min: 0,
            max: 120
        },

        gender: {
            type: String,
            enum: ["M", "F", "Other"],
            required: true
        },

        phone: {
            type: String,
            required: true
        },

        bloodGroup: {
            type: String,
            default: ""
        },

        emergencyContact: {
            type: String,
            default: ""
        },

        allergies: {
            type: String,
            default: ""
        },

        active: {
            type: Boolean,
            default: true
        },

        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            default: null
        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model("Patient", patientSchema);