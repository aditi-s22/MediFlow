// Maps a user's role to the dashboard they should land on after login/register.
const getDashboardPath = (role) => {
  if (role === "doctor") return "/doctor/dashboard";
  if (role === "admin") return "/admin/dashboard";
  return "/patient/dashboard";
};

export default getDashboardPath;
