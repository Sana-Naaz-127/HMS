const mongoose = require("mongoose");

const billSchema = new mongoose.Schema(
    {
        billId: {
            type: String,
            unique: true,
            required: true
        },

        patient: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Patient",
            required: true
        },

        appointment: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Appointment",
            default: null
        },

        amount: {
            type: Number,
            required: true,
            min: 0
        },

        description: {
            type: String,
            default: ""
        },

        status: {
            type: String,
            enum: ["Pending", "Paid", "Cancelled"],
            default: "Pending"
        },

        paymentMethod: {
            type: String,
            enum: [
                "Cash",
                "Card",
                "UPI",
                "Insurance",
                ""
            ],
            default: ""
        },

        paymentDate: {
            type: String,
            default: ""
        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model("Bill", billSchema);