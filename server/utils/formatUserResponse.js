// Shapes a User document into the safe object we send back to clients.
// Uses _id (not id) to match every other endpoint in the app (getProfile,
// getDoctors, appointments, etc. all return raw Mongoose docs with _id) —
// the frontend relies on _id consistently everywhere.
const formatUserResponse = (user) => ({
  _id: user._id,
  name: user.name,
  email: user.email,
  role: user.role,
  phone: user.phone,
  gender: user.gender,
  specialization: user.specialization,
  experience: user.experience,
  consultationFee: user.consultationFee,
  availableSlots: user.availableSlots,
});

export default formatUserResponse;
