import bcrypt from "bcryptjs";
import User from "../models/User.js";
import formatUserResponse from "../utils/formatUserResponse.js";

// @route   GET /api/users/profile
// @desc    Get the logged-in user's own profile
const getProfile = async (req, res) => {
  // req.user was set by the protect middleware
  res.json({ user: req.user });
};

// @route   PUT /api/users/profile
// @desc    Update the logged-in user's own profile
const updateProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const { name, phone, gender, password } = req.body;
    // role is intentionally ignored — users can never change their own role

    if (name) user.name = name;
    if (phone) user.phone = phone;
    if (gender) user.gender = gender;

    if (password) {
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(password, salt);
    }

    const updatedUser = await user.save();

    res.json({
      user: formatUserResponse(updatedUser),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export { getProfile, updateProfile };
