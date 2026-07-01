import Navbar from "../components/Navbar";

// Wraps any page that should show the shared Navbar — avoids repeating
// <Navbar /> at the top of every authenticated page.
function AuthenticatedLayout({ children }) {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      {children}
    </div>
  );
}

export default AuthenticatedLayout;
