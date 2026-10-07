require("dotenv").config();

const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const User = require("./models/User");
const Patient = require("./models/Patient");
const Doctor = require("./models/Doctor");

const users = [
    {
        name: "Admin Root",
        email: "admin@careline.com",
        password: "admin123",
        role: "admin",
        phone: "9000000001"
    },
    {
        name: "Dr. A. Sen",
        email: "doctor@careline.com",
        password: "doctor123",
        role: "doctor",
        phone: "9000000002"
    },
    {
        name: "Riya Das",
        email: "reception@careline.com",
        password: "reception123",
        role: "reception",
        phone: "9000000003"
    },
    {
        name: "Rahul Roy",
        email: "patient@careline.com",
        password: "patient123",
        role: "patient",
        phone: "9000000004"
    }
];

const patients = [
    {
        patientId: "P1001",
        name: "Rahul Roy",
        age: 24,
        gender: "M",
        phone: "9000000004",
        bloodGroup: "O+",
        emergencyContact: "9000000010",
        allergies: "None"
    },
    {
        patientId: "P1002",
        name: "Ananya Sharma",
        age: 31,
        gender: "F",
        phone: "9000000011",
        bloodGroup: "A+",
        emergencyContact: "9000000012",
        allergies: "Penicillin"
    },
    {
        patientId: "P1003",
        name: "Arjun Das",
        age: 45,
        gender: "M",
        phone: "9000000013",
        bloodGroup: "B+",
        emergencyContact: "9000000014",
        allergies: "None"
    },
    {
        patientId: "P1004",
        name: "Priya Nair",
        age: 28,
        gender: "F",
        phone: "9000000015",
        bloodGroup: "AB+",
        emergencyContact: "9000000016",
        allergies: "Dust"
    }
];

const doctors = [
    {
        doctorId: 1,
        name: "Dr. A. Sen",
        dept: "Cardiology",
        fee: 800,
        days: [1, 2, 3, 4, 5],
        start: 9,
        end: 13
    },
    {
        doctorId: 2,
        name: "Dr. M. Khan",
        dept: "Orthopedics",
        fee: 600,
        days: [1, 3, 5],
        start: 10,
        end: 16
    },
    {
        doctorId: 3,
        name: "Dr. P. Iyer",
        dept: "Pediatrics",
        fee: 500,
        days: [0, 2, 4, 6],
        start: 9,
        end: 14
    }
];

const seedData = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);

        console.log("Connected to MongoDB");

        // -------------------------
        // USERS
        // -------------------------

        for (const userData of users) {
            const existingUser = await User.findOne({
                email: userData.email
            });

            if (existingUser) {
                console.log(`User already exists: ${userData.email}`);
                continue;
            }

            const hashedPassword = await bcrypt.hash(
                userData.password,
                12
            );

            await User.create({
                name: userData.name,
                email: userData.email,
                password: hashedPassword,
                role: userData.role,
                phone: userData.phone
            });

            console.log(`Created user: ${userData.email}`);
        }

        // -------------------------
        // PATIENTS
        // -------------------------

        const patientUser = await User.findOne({
            email: "patient@careline.com"
        });

        for (const patientData of patients) {
            const existingPatient = await Patient.findOne({
                patientId: patientData.patientId
            });

            if (existingPatient) {
                console.log(
                    `Patient already exists: ${patientData.patientId}`
                );
                continue;
            }

            await Patient.create({
                ...patientData,
                user:
                    patientData.patientId === "P1001"
                        ? patientUser?._id
                        : null
            });

            console.log(
                `Created patient: ${patientData.patientId}`
            );
        }

        // -------------------------
// DOCTORS
// -------------------------

for (const doctorData of doctors) {
    const existingDoctor = await Doctor.findOne({
        doctorId: doctorData.doctorId
    });

    if (existingDoctor) {
        console.log(
            `Doctor already exists: ${doctorData.doctorId}`
        );
        continue;
    }

    const doctorUser = await User.findOne({
        email: doctorData.doctorId === 1
            ? "doctor@careline.com"
            : null
    });

    await Doctor.create({
        ...doctorData,
        user: doctorUser?._id || null
    });

    console.log(
        `Created doctor: ${doctorData.name}`
    );
}

        console.log("Seeding completed successfully");

        await mongoose.connection.close();
        process.exit(0);

    } catch (error) {
        console.error("Seeding failed:", error.message);

        await mongoose.connection.close();
        process.exit(1);
    }
};

seedData();