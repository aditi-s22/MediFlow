import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import getDashboardPath from "../utils/getDashboardPath";

const navLinksByRole = {
  patient: [
    { to: "/doctors", label: "Doctors" },
    { to: "/appointments", label: "Appointments" },
    { to: "/profile", label: "Profile" },
  ],
  doctor: [
    { to: "/appointments", label: "Appointments" },
    { to: "/profile", label: "Profile" },
  ],
  admin: [
    { to: "/admin/doctors", label: "Doctors" },
    { to: "/appointments", label: "Appointments" },
  ],
};

function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const dashboardPath = getDashboardPath(user?.role);
  const links = navLinksByRole[user?.role] || [];
  const allLinks = [{ to: dashboardPath, label: "Dashboard" }, ...links];

  const isActive = (path) => location.pathname === path;

  const linkClass = (path) =>
    `text-sm font-medium transition-colors ${
      isActive(path)
        ? "text-blue-600"
        : "text-gray-600 hover:text-gray-900"
    }`;

  return (
    <nav className="sticky top-0 z-30 border-b border-gray-200 bg-white/95 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-3.5">
        {/* Logo */}
        <Link to={dashboardPath} className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-md bg-blue-600">
            <span className="text-xs font-bold text-white">M</span>
          </div>
          <span className="text-base font-bold tracking-tight text-gray-900">MediFlow</span>
        </Link>

        {/* Desktop nav */}
        <div className="hidden items-center gap-7 md:flex">
          {allLinks.map((link) => (
            <Link key={link.to} to={link.to} className={linkClass(link.to)}>
              {link.label}
            </Link>
          ))}
        </div>

        {/* Desktop actions */}
        <div className="hidden items-center gap-4 md:flex">
          <span className="text-sm text-gray-400">{user?.name}</span>
          <button
            type="button"
            onClick={handleLogout}
            className="rounded-lg border border-gray-200 px-3 py-1.5 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-50 hover:text-gray-900"
          >
            Sign out
          </button>
        </div>

        {/* Mobile hamburger */}
        <button
          type="button"
          className="flex h-9 w-9 items-center justify-center rounded-lg text-gray-500 hover:bg-gray-100 md:hidden"
          onClick={() => setMobileOpen((o) => !o)}
          aria-label={mobileOpen ? "Close menu" : "Open menu"}
          aria-expanded={mobileOpen}
        >
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="border-t border-gray-100 bg-white px-6 pb-4 md:hidden">
          <div className="flex flex-col gap-1 pt-3">
            {allLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                onClick={() => setMobileOpen(false)}
                className={`rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                  isActive(link.to)
                    ? "bg-blue-50 text-blue-600"
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                }`}
              >
                {link.label}
              </Link>
            ))}
            <div className="mt-2 border-t border-gray-100 pt-2">
              <p className="px-3 py-1 text-xs text-gray-400">{user?.name}</p>
              <button
                type="button"
                onClick={() => { handleLogout(); setMobileOpen(false); }}
                className="w-full rounded-lg px-3 py-2.5 text-left text-sm font-medium text-red-600 hover:bg-red-50"
              >
                Sign out
              </button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}

export default Navbar;
