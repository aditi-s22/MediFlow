import jwt from "jsonwebtoken";

// Creates a signed JWT containing the user's id and role.
// Expires in 30 days — frontend stores this and sends it back on every request.
const generateToken = (userId, role) => {
  return jwt.sign({ id: userId, role }, process.env.JWT_SECRET, {
    expiresIn: "30d",
  });
};

export default generateToken;
