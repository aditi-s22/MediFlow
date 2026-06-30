// One-time development script to create the first admin account.
// Run with: node scripts/createAdmin.js
import dotenv from "dotenv";
import bcrypt from "bcryptjs";
import connectDB from "../config/db.js";
import User from "../models/User.js";
import mongoose from "mongoose";

dotenv.config();

const createAdmin = async () => {
  await connectDB();

  const { ADMIN_NAME, ADMIN_EMAIL, ADMIN_PASSWORD, ADMIN_PHONE } = process.env;

  if (!ADMIN_NAME || !ADMIN_EMAIL || !ADMIN_PASSWORD || !ADMIN_PHONE) {
    console.error("Missing ADMIN_NAME, ADMIN_EMAIL, ADMIN_PASSWORD, or ADMIN_PHONE in .env");
    process.exit(1);
  }

  const existingAdmin = await User.findOne({ role: "admin" });
  if (existingAdmin) {
    console.log(`Admin already exists: ${existingAdmin.email}`);
    await mongoose.disconnect();
    process.exit(0);
  }

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(ADMIN_PASSWORD, salt);

  const admin = await User.create({
    name: ADMIN_NAME,
    email: ADMIN_EMAIL,
    password: hashedPassword,
    phone: ADMIN_PHONE,
    role: "admin",
  });

  console.log(`Admin created: ${admin.email}`);
  await mongoose.disconnect();
  process.exit(0);
};

createAdmin().catch((error) => {
  console.error("Failed to create admin:", error.message);
  process.exit(1);
});
