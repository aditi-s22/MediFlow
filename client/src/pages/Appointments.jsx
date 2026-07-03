import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Calendar } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import AuthenticatedLayout from "../layouts/AuthenticatedLayout";
import AppointmentStatusBadge from "../components/AppointmentStatusBadge";
import EmptyState from "../components/EmptyState";
import { SkeletonRow } from "../components/Skeleton";
import * as appointmentService from "../services/appointmentService";
import * as adminService from "../services/adminService";
import formatDoctorName from "../utils/formatDoctorName";

function Appointments() {
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";

  const [appointments, setAppointments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [cancellingId, setCancellingId] = useState(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        const response = isAdmin
          ? await adminService.getAllAppointments()
          : await appointmentService.getAppointments();
        setAppointments(response.data.appointments);
      } catch {
        toast.error("Could not load appointments. Please refresh the page.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchAppointments();
  }, [isAdmin]);

  const handleCancel = async (appointmentId) => {
    setCancellingId(appointmentId);
    try {
      await appointmentService.cancelAppointment(appointmentId);
      setAppointments((prev) =>
        prev.map((a) => (a._id === appointmentId ? { ...a, status: "cancelled" } : a))
      );
      toast.success("Appointment cancelled");
    } catch (err) {
      toast.error(err.response?.data?.message || "Could not cancel appointment.");
    } finally {
      setCancellingId(null);
    }
  };

  const visibleAppointments = appointments.filter((appt) => {
    if (statusFilter && appt.status !== statusFilter) return false;
    if (search) {
      const term = search.toLowerCase();
      if (user?.role === "patient") {
        return appt.doctor?.name?.toLowerCase().includes(term);
      } else if (user?.role === "doctor") {
        return appt.patient?.name?.toLowerCase().includes(term);
      } else if (isAdmin) {
        return (
          appt.patient?.name?.toLowerCase().includes(term) ||
          appt.doctor?.name?.toLowerCase().includes(term)
        );
      }
    }
    return true;
  });

  return (
    <AuthenticatedLayout>
      <div className="mx-auto max-w-4xl px-6 py-8">
        <h1 className="text-xl font-semibold text-gray-900">
          {isAdmin ? "All Appointments" : "My Appointments"}
        </h1>
        <p className="mt-0.5 text-sm text-gray-500">
          {isAdmin ? "System-wide view of every appointment." : "Your full appointment history."}
        </p>

        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <input
            type="search"
            placeholder={
              user?.role === "patient"
                ? "Search by doctor name..."
                : user?.role === "doctor"
                ? "Search by patient name..."
                : "Search by patient or doctor name..."
            }
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            aria-label="Search appointments"
            className="flex-1 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm shadow-sm placeholder:text-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
          />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            aria-label="Filter by status"
            className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
          >
            <option value="">All statuses</option>
            <option value="confirmed">Confirmed</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>

        {isLoading ? (
          <div className="mt-6 space-y-3">
            {[...Array(4)].map((_, i) => <SkeletonRow key={i} />)}
          </div>
        ) : visibleAppointments.length === 0 ? (
          <div className="mt-6">
            <EmptyState
              icon={Calendar}
              title="No appointments found"
              description={
                statusFilter || search
                  ? "Try adjusting your filters."
                  : isAdmin
                  ? "No appointments have been booked yet."
                  : "You haven't booked any appointments yet."
              }
              action={!isAdmin && !search && !statusFilter ? { to: "/doctors", label: "Book Appointment" } : undefined}
            />
          </div>
        ) : (
          <div className="mt-6 space-y-2">
            {visibleAppointments.map((appt) => (
              <div
                key={appt._id}
                className={`flex items-start justify-between gap-4 rounded-xl bg-white px-5 py-4 ring-1 ring-gray-100 transition-opacity ${
                  appt.status === "cancelled" ? "opacity-40" : ""
                }`}
              >
                <div className="min-w-0">
                  {isAdmin ? (
                    <>
                      <p className="text-sm font-medium text-gray-900">
                        {appt.patient?.name}
                        <span className="mx-2 text-gray-200">→</span>
                        <span className="text-gray-600">{formatDoctorName(appt.doctor?.name)}</span>
                      </p>
                      <p className="mt-0.5 text-xs text-gray-400">{appt.doctor?.specialization}</p>
                    </>
                  ) : user?.role === "doctor" ? (
                    <p className="text-sm font-medium text-gray-900">{appt.patient?.name}</p>
                  ) : (
                    <>
                      <p className="text-sm font-medium text-gray-900">{formatDoctorName(appt.doctor?.name)}</p>
                      <p className="mt-0.5 text-xs text-gray-400">{appt.doctor?.specialization}</p>
                    </>
                  )}
                  <p className="mt-1 text-xs text-gray-400">
                    {new Date(appt.appointmentDate).toLocaleDateString("en-IN", {
                      weekday: "short", day: "numeric", month: "short", year: "numeric",
                    })}{" "}
                    · {appt.appointmentTime}
                  </p>
                  {appt.reason && (
                    <p className="mt-0.5 truncate text-xs italic text-gray-400">
                      &ldquo;{appt.reason}&rdquo;
                    </p>
                  )}
                </div>
                <div className="flex shrink-0 items-center gap-3">
                  <AppointmentStatusBadge appointment={appt} />
                  {!isAdmin && appt.status === "confirmed" && (
                    <button
                      type="button"
                      onClick={() => handleCancel(appt._id)}
                      disabled={cancellingId === appt._id}
                      className="rounded-lg border border-red-200 px-3 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-1 disabled:opacity-50"
                    >
                      {cancellingId === appt._id ? "Cancelling…" : "Cancel"}
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </AuthenticatedLayout>
  );
}

export default Appointments;
