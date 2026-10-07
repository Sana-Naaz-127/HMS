const Doctor = require("../models/Doctor");

const getDoctors = async (req, res) => {
    try {
        const doctors = await Doctor.find({ active: true })
            .sort({ doctorId: 1 });

        res.json({
            success: true,
            doctors
        });
    } catch (error) {
        console.error("Get doctors error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to load doctors."
        });
    }
};


const getDoctor = async (req, res) => {
    try {
        const doctor = await Doctor.findOne({
            doctorId: Number(req.params.id)
        });

        if (!doctor) {
            return res.status(404).json({
                success: false,
                message: "Doctor not found."
            });
        }

        res.json({
            success: true,
            doctor
        });
    } catch (error) {
        console.error("Get doctor error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to load doctor."
        });
    }
};


const markLeave = async (req, res) => {
    try {
        const { date } = req.body;

        if (!date) {
            return res.status(400).json({
                success: false,
                message: "Leave date is required."
            });
        }

        const doctor = await Doctor.findOne({
            doctorId: Number(req.params.id)
        });

        if (!doctor) {
            return res.status(404).json({
                success: false,
                message: "Doctor not found."
            });
        }

        if (!doctor.leave.includes(date)) {
            doctor.leave.push(date);
            await doctor.save();
        }

        res.json({
            success: true,
            message: "Doctor leave saved.",
            doctor
        });
    } catch (error) {
        console.error("Leave error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to save doctor leave."
        });
    }
};


module.exports = {
    getDoctors,
    getDoctor,
    markLeave
};