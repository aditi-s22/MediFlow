import bcrypt from "bcryptjs";
import User from "../models/User.js";
import formatUserResponse from "../utils/formatUserResponse.js";

// @route   GET /api/doctors
// @desc    List all doctors, optionally filtered by specialization or name search
const getDoctors = async (req, res) => {
  try {
    const { specialization, search } = req.query;

    const filter = { role: "doctor" };

    if (specialization) {
      filter.specialization = { $regex: specialization, $options: "i" };
    }

    if (search) {
      filter.name = { $regex: search, $options: "i" };
    }

    const doctors = await User.find(filter).select("-password");

    res.json({ doctors });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @route   GET /api/doctors/:id
// @desc    Get a single doctor's details
const getDoctorById = async (req, res) => {
  try {
    const doctor = await User.findOne({ _id: req.params.id, role: "doctor" }).select("-password");

    if (!doctor) {
      return res.status(404).json({ message: "Doctor not found" });
    }

    res.json({ doctor });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @route   POST /api/doctors
// @desc    Admin creates a new doctor account
const createDoctor = async (req, res) => {
  try {
    const { name, email, password, phone, gender, specialization, experience, consultationFee, availableSlots } =
      req.body;

    if (!name || !email || !password || !phone || !specialization || experience === undefined || consultationFee === undefined) {
      return res.status(400).json({ message: "Please fill in all required doctor fields" });
    }

    const existingUser = await User.findOne({ email: email.toLowerCase().trim() });
    if (existingUser) {
      return res.status(400).json({ message: "An account with this email already exists" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const doctor = await User.create({
      name,
      email,
      password: hashedPassword,
      phone,
      gender,
      role: "doctor",
      specialization,
      experience,
      consultationFee,
      availableSlots: availableSlots || [],
      age: req.body.age,
      qualification: req.body.qualification,
      hospitalExperience: req.body.hospitalExperience,
      languagesSpoken: req.body.languagesSpoken || [],
      aboutDoctor: req.body.aboutDoctor,
      availableDays: req.body.availableDays || [],
      profilePicture: req.body.profilePicture,
      rating: req.body.rating || 0,
      reviewCount: req.body.reviewCount || 0,
      patientsTreated: req.body.patientsTreated || 0,
      hospitalName: req.body.hospitalName,
      clinicAddress: req.body.clinicAddress,
      medicalRegistrationNumber: req.body.medicalRegistrationNumber,
      biography: req.body.biography,
      status: req.body.status || "active",
    });

    res.status(201).json({ doctor: formatUserResponse(doctor) });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @route   PUT /api/doctors/:id
// @desc    Admin updates a doctor's details
const updateDoctor = async (req, res) => {
  try {
    const doctor = await User.findOne({ _id: req.params.id, role: "doctor" });
    if (!doctor) {
      return res.status(404).json({ message: "Doctor not found" });
    }

    const {
      name, phone, gender, specialization, experience, consultationFee, availableSlots,
      age, qualification, hospitalExperience, languagesSpoken, aboutDoctor, availableDays,
      profilePicture, rating, reviewCount, patientsTreated, hospitalName, clinicAddress,
      medicalRegistrationNumber, biography, status
    } = req.body;
    // email and role are intentionally not editable here

    if (name) doctor.name = name;
    if (phone) doctor.phone = phone;
    if (gender) doctor.gender = gender;
    if (specialization) doctor.specialization = specialization;
    if (experience !== undefined) doctor.experience = experience;
    if (consultationFee !== undefined) doctor.consultationFee = consultationFee;
    if (availableSlots) doctor.availableSlots = availableSlots;
    if (age !== undefined) doctor.age = age;
    if (qualification !== undefined) doctor.qualification = qualification;
    if (hospitalExperience !== undefined) doctor.hospitalExperience = hospitalExperience;
    if (languagesSpoken !== undefined) doctor.languagesSpoken = languagesSpoken;
    if (aboutDoctor !== undefined) doctor.aboutDoctor = aboutDoctor;
    if (availableDays !== undefined) doctor.availableDays = availableDays;
    if (profilePicture !== undefined) doctor.profilePicture = profilePicture;
    if (rating !== undefined) doctor.rating = rating;
    if (reviewCount !== undefined) doctor.reviewCount = reviewCount;
    if (patientsTreated !== undefined) doctor.patientsTreated = patientsTreated;
    if (hospitalName !== undefined) doctor.hospitalName = hospitalName;
    if (clinicAddress !== undefined) doctor.clinicAddress = clinicAddress;
    if (medicalRegistrationNumber !== undefined) doctor.medicalRegistrationNumber = medicalRegistrationNumber;
    if (biography !== undefined) doctor.biography = biography;
    if (status !== undefined) doctor.status = status;

    const updatedDoctor = await doctor.save();

    res.json({ doctor: formatUserResponse(updatedDoctor) });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @route   DELETE /api/doctors/:id
// @desc    Admin deletes a doctor account
const deleteDoctor = async (req, res) => {
  try {
    const doctor = await User.findOne({ _id: req.params.id, role: "doctor" });
    if (!doctor) {
      return res.status(404).json({ message: "Doctor not found" });
    }

    await doctor.deleteOne();

    res.json({ message: "Doctor deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export { getDoctors, getDoctorById, createDoctor, updateDoctor, deleteDoctor };
