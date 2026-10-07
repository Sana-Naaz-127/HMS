const Appointment = require("../models/Appointment");

const getAppointments = async (req, res) => {
    try {
        const appointments = await Appointment.find()
            .populate("patient")
            .populate("doctor")
            .sort({ date: 1, time: 1 });

        res.json({
            success: true,
            appointments
        });

    } catch (error) {
        console.error("Get appointments error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to fetch appointments."
        });
    }
};

const getAppointment = async (req, res) => {
    try {
        const appointment = await Appointment.findById(req.params.id)
            .populate("patient")
            .populate("doctor");

        if (!appointment) {
            return res.status(404).json({
                success: false,
                message: "Appointment not found."
            });
        }

        res.json({
            success: true,
            appointment
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to fetch appointment."
        });
    }
};

const createAppointment = async (req, res) => {
    try {
        const {
            patient,
            doctor,
            date,
            time,
            reason,
            notes
        } = req.body;

        if (!patient || !doctor || !date || !time) {
            return res.status(400).json({
                success: false,
                message: "Patient, doctor, date and time are required."
            });
        }

        const lastAppointment = await Appointment.findOne()
            .sort({ createdAt: -1 });

        let nextNumber = 1001;

        if (lastAppointment) {
            const lastNumber =
                parseInt(
                    lastAppointment.appointmentId.replace("A", "")
                ) || 1000;

            nextNumber = lastNumber + 1;
        }

        const appointment = await Appointment.create({
            appointmentId: `A${nextNumber}`,
            patient,
            doctor,
            date,
            time,
            reason,
            notes
        });

        const populatedAppointment =
            await Appointment.findById(appointment._id)
                .populate("patient")
                .populate("doctor");

        res.status(201).json({
            success: true,
            message: "Appointment created successfully.",
            appointment: populatedAppointment
        });

    } catch (error) {
        console.error("Create appointment error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to create appointment."
        });
    }
};

const updateAppointmentStatus = async (req, res) => {
    try {
        const { status } = req.body;

        const appointment =
            await Appointment.findByIdAndUpdate(
                req.params.id,
                { status },
                { new: true }
            );

        if (!appointment) {
            return res.status(404).json({
                success: false,
                message: "Appointment not found."
            });
        }

        res.json({
            success: true,
            message: "Appointment status updated.",
            appointment
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to update appointment."
        });
    }
};

const deleteAppointment = async (req, res) => {
    try {
        const appointment =
            await Appointment.findByIdAndDelete(req.params.id);

        if (!appointment) {
            return res.status(404).json({
                success: false,
                message: "Appointment not found."
            });
        }

        res.json({
            success: true,
            message: "Appointment deleted successfully."
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to delete appointment."
        });
    }
};

module.exports = {
    getAppointments,
    getAppointment,
    createAppointment,
    updateAppointmentStatus,
    deleteAppointment
};