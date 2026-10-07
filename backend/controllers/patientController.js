const Patient = require("../models/Patient");

const getPatients = async (req, res) => {
    try {
        const patients = await Patient.find().sort({ createdAt: -1 });

        res.json({
            success: true,
            patients
        });
    } catch (error) {
        console.error("Get patients error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to load patients."
        });
    }
};

const getPatient = async (req, res) => {
    try {
        const patient = await Patient.findOne({
            patientId: req.params.id
        });

        if (!patient) {
            return res.status(404).json({
                success: false,
                message: "Patient not found."
            });
        }

        res.json({
            success: true,
            patient
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to load patient."
        });
    }
};

const createPatient = async (req, res) => {
    try {
        const {
            name,
            age,
            gender,
            phone,
            bloodGroup,
            emergencyContact,
            allergies
        } = req.body;

        if (!name || age === undefined || !gender || !phone) {
            return res.status(400).json({
                success: false,
                message: "Name, age, gender and phone are required."
            });
        }

        const lastPatient = await Patient.findOne()
            .sort({ createdAt: -1 });

        let nextNumber = 1001;

        if (lastPatient?.patientId) {
            const number = parseInt(
                lastPatient.patientId.replace("P", "")
            );

            if (!isNaN(number)) {
                nextNumber = number + 1;
            }
        }

        const patient = await Patient.create({
            patientId: `P${nextNumber}`,
            name,
            age,
            gender,
            phone,
            bloodGroup,
            emergencyContact,
            allergies
        });

        res.status(201).json({
            success: true,
            message: "Patient registered successfully.",
            patient
        });
    } catch (error) {
        console.error("Create patient error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to create patient."
        });
    }
};

const updatePatient = async (req, res) => {
    try {
        const patient = await Patient.findOneAndUpdate(
            { patientId: req.params.id },
            req.body,
            {
                new: true,
                runValidators: true
            }
        );

        if (!patient) {
            return res.status(404).json({
                success: false,
                message: "Patient not found."
            });
        }

        res.json({
            success: true,
            message: "Patient updated successfully.",
            patient
        });
    } catch (error) {
        console.error("Update patient error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to update patient."
        });
    }
};

const updatePatientStatus = async (req, res) => {
    try {
        const patient = await Patient.findOneAndUpdate(
            { patientId: req.params.id },
            { active: req.body.active },
            {
                new: true,
                runValidators: true
            }
        );

        if (!patient) {
            return res.status(404).json({
                success: false,
                message: "Patient not found."
            });
        }

        res.json({
            success: true,
            message: "Patient status updated.",
            patient
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to update patient status."
        });
    }
};

module.exports = {
    getPatients,
    getPatient,
    createPatient,
    updatePatient,
    updatePatientStatus
};