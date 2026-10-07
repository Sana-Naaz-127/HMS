const Bill = require("../models/Bill");

const getBills = async (req, res) => {
    try {
        const bills = await Bill.find()
            .populate("patient")
            .populate("appointment")
            .sort({ createdAt: -1 });

        res.json({
            success: true,
            bills
        });

    } catch (error) {
        console.error("Get bills error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to fetch bills."
        });
    }
};

const getPatientBills = async (req, res) => {
    try {
        const bills = await Bill.find({
            patient: req.params.patientId
        })
            .populate("appointment")
            .sort({ createdAt: -1 });

        res.json({
            success: true,
            bills
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to fetch patient bills."
        });
    }
};

const createBill = async (req, res) => {
    try {
        const {
            patient,
            appointment,
            amount,
            description
        } = req.body;

        if (!patient || amount === undefined) {
            return res.status(400).json({
                success: false,
                message: "Patient and amount are required."
            });
        }

        const lastBill = await Bill.findOne()
            .sort({ createdAt: -1 });

        let nextNumber = 1001;

        if (lastBill) {
            const lastNumber =
                parseInt(
                    lastBill.billId.replace("B", "")
                ) || 1000;

            nextNumber = lastNumber + 1;
        }

        const bill = await Bill.create({
            billId: `B${nextNumber}`,
            patient,
            appointment,
            amount,
            description
        });

        const populatedBill =
            await Bill.findById(bill._id)
                .populate("patient")
                .populate("appointment");

        res.status(201).json({
            success: true,
            message: "Bill created successfully.",
            bill: populatedBill
        });

    } catch (error) {
        console.error("Create bill error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to create bill."
        });
    }
};

const updateBillStatus = async (req, res) => {
    try {
        const {
            status,
            paymentMethod,
            paymentDate
        } = req.body;

        const bill =
            await Bill.findByIdAndUpdate(
                req.params.id,
                {
                    status,
                    paymentMethod,
                    paymentDate
                },
                {
                    new: true,
                    runValidators: true
                }
            );

        if (!bill) {
            return res.status(404).json({
                success: false,
                message: "Bill not found."
            });
        }

        res.json({
            success: true,
            message: "Bill updated successfully.",
            bill
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to update bill."
        });
    }
};

module.exports = {
    getBills,
    getPatientBills,
    createBill,
    updateBillStatus
};