const mongoose = require("mongoose");

const doctorSchema = new mongoose.Schema(
    {
        doctorId: {
            type: Number,
            unique: true,
            required: true
        },

        name: {
            type: String,
            required: true,
            trim: true
        },

        dept: {
            type: String,
            required: true,
            trim: true
        },

        fee: {
            type: Number,
            required: true,
            min: 0
        },

        days: {
            type: [Number],
            default: []
        },

        start: {
            type: Number,
            required: true
        },

        end: {
            type: Number,
            required: true
        },

        leave: {
            type: [String],
            default: []
        },

        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            default: null
        },

        active: {
            type: Boolean,
            default: true
        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model("Doctor", doctorSchema);