import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import getDashboardPath from "../utils/getDashboardPath";

function NotFound() {
  const { user } = useAuth();
  const home = user ? getDashboardPath(user.role) : "/";

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 px-4 text-center">
      <div className="flex h-20 w-20 items-center justify-center rounded-full bg-blue-50">
        <span className="text-4xl font-black text-blue-600">4</span>
        <span className="text-4xl font-black text-blue-300">0</span>
        <span className="text-4xl font-black text-blue-600">4</span>
      </div>
      <h1 className="mt-6 text-2xl font-bold text-gray-900">Page not found</h1>
      <p className="mt-2 max-w-sm text-sm text-gray-500">
        The page you&apos;re looking for doesn&apos;t exist or has been moved.
      </p>
      <Link
        to={home}
        className="mt-8 rounded-lg bg-blue-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
      >
        {user ? "Back to Dashboard" : "Go to Home"}
      </Link>
    </div>
  );
}

export default NotFound;
