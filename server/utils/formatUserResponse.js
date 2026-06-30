// Shapes a User document into the safe object we send back to clients.
// Keeps the response consistent across register, login, and profile endpoints.
const formatUserResponse = (user) => ({
  id: user._id,
  name: user.name,
  email: user.email,
  role: user.role,
  phone: user.phone,
  gender: user.gender,
});

export default formatUserResponse;
