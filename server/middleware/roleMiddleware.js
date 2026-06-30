// Restricts a route to specific roles. Must run after `protect`, since it
// relies on req.user already being set.
// Usage: router.post("/", protect, authorizeRoles("admin"), createDoctor)
const authorizeRoles = (...allowedRoles) => {
  return (req, res, next) => {
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ message: "Not authorized to access this resource" });
    }
    next();
  };
};

export { authorizeRoles };
