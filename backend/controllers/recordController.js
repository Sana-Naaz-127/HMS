const MedicalRecord = require("../models/MedicalRecord");

const getRecords = async (req, res) => {
    try {
        const records = await MedicalRecord.find()
            .populate("patient")
            .populate("doctor")
            .populate("appointment")
            .sort({ createdAt: -1 });

        res.json({
            success: true,
            records
        });

    } catch (error) {
        console.error("Get records error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to fetch medical records."
        });
    }
};

const getPatientRecords = async (req, res) => {
    try {
        const records = await MedicalRecord.find({
            patient: req.params.patientId
        })
            .populate("doctor")
            .populate("appointment")
            .sort({ createdAt: -1 });

        res.json({
            success: true,
            records
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to fetch patient records."
        });
    }
};

const createRecord = async (req, res) => {
    try {
        const {
            patient,
            doctor,
            appointment,
            diagnosis,
            symptoms,
            prescription,
            notes,
            recordDate
        } = req.body;

        if (!patient || !doctor || !diagnosis || !recordDate) {
            return res.status(400).json({
                success: false,
                message:
                    "Patient, doctor, diagnosis and record date are required."
            });
        }

        const record = await MedicalRecord.create({
            patient,
            doctor,
            appointment,
            diagnosis,
            symptoms,
            prescription,
            notes,
            recordDate
        });

        const populatedRecord =
            await MedicalRecord.findById(record._id)
                .populate("patient")
                .populate("doctor")
                .populate("appointment");

        res.status(201).json({
            success: true,
            message: "Medical record created successfully.",
            record: populatedRecord
        });

    } catch (error) {
        console.error("Create record error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to create medical record."
        });
    }
};

const updateRecord = async (req, res) => {
    try {
        const record =
            await MedicalRecord.findByIdAndUpdate(
                req.params.id,
                req.body,
                {
                    new: true,
                    runValidators: true
                }
            )
                .populate("patient")
                .populate("doctor")
                .populate("appointment");

        if (!record) {
            return res.status(404).json({
                success: false,
                message: "Medical record not found."
            });
        }

        res.json({
            success: true,
            message: "Medical record updated successfully.",
            record
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to update medical record."
        });
    }
};

module.exports = {
    getRecords,
    getPatientRecords,
    createRecord,
    updateRecord
};