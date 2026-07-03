import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      minlength: [2, "Name must be at least 2 characters"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, "Please enter a valid email"],
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [6, "Password must be at least 6 characters"],
    },
    role: {
      type: String,
      enum: ["patient", "doctor", "admin"],
      default: "patient",
    },
    phone: {
      type: String,
      required: [true, "Phone number is required"],
      match: [/^\d{10}$/, "Phone number must be 10 digits"],
    },
    gender: {
      type: String,
      enum: ["male", "female", "other"],
    },

    // Doctor-only fields — left empty for patients and admins
    specialization: {
      type: String,
    },
    experience: {
      type: Number,
      min: [0, "Experience cannot be negative"],
    },
    consultationFee: {
      type: Number,
      min: [0, "Consultation fee cannot be negative"],
    },
    availableSlots: {
      type: [String],
      default: [],
    },
    age: {
      type: Number,
    },
    qualification: {
      type: String,
    },
    hospitalExperience: {
      type: String,
    },
    languagesSpoken: {
      type: [String],
      default: [],
    },
    aboutDoctor: {
      type: String,
    },
    availableDays: {
      type: [String],
      default: [],
    },
    profilePicture: {
      type: String,
    },
    rating: {
      type: Number,
      default: 0,
    },
    reviewCount: {
      type: Number,
      default: 0,
    },
    patientsTreated: {
      type: Number,
      default: 0,
    },
    hospitalName: {
      type: String,
      default: "MediFlow General Hospital",
    },
    clinicAddress: {
      type: String,
    },
    medicalRegistrationNumber: {
      type: String,
    },
    biography: {
      type: String,
    },
    status: {
      type: String,
      enum: ["active", "on_leave", "inactive"],
      default: "active",
    },
  },
  {
    timestamps: true,
  }
);

const User = mongoose.model("User", userSchema);

export default User;
