import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Calendar, CalendarCheck, CheckCircle, CalendarX, Users, ChevronRight } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import AuthenticatedLayout from "../layouts/AuthenticatedLayout";
import DashboardCard from "../components/DashboardCard";
import AppointmentStatusBadge from "../components/AppointmentStatusBadge";
import { SkeletonCard, SkeletonRow } from "../components/Skeleton";
import EmptyState from "../components/EmptyState";
import * as appointmentService from "../services/appointmentService";
import * as queueService from "../services/queueService";
import socket from "../services/socket";

const isToday = (dateString) => {
  const d = new Date(dateString);
  const t = new Date();
  return d.getFullYear() === t.getFullYear() && d.getMonth() === t.getMonth() && d.getDate() === t.getDate();
};

function DoctorDashboard() {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [completingId, setCompletingId] = useState(null);
  const [callingNext, setCallingNext] = useState(false);

  const [queue, setQueue] = useState([]);
  const [currentServing, setCurrentServing] = useState(null);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [apptRes, queueRes] = await Promise.all([
          appointmentService.getAppointments(),
          queueService.getQueue(user._id).catch(() => null),
        ]);
        const sorted = [...apptRes.data.appointments].sort(
          (a, b) =>
            new Date(a.appointmentDate) - new Date(b.appointmentDate) ||
            a.appointmentTime.localeCompare(b.appointmentTime)
        );
        setAppointments(sorted);
        if (queueRes) {
          setQueue(queueRes.data.queue);
          setCurrentServing(queueRes.data.currentServing);
        }
      } catch {
        toast.error("Could not load your appointments");
      } finally {
        setIsLoading(false);
      }
    };

    fetchAll();

    socket.connect();
    socket.emit("joinDoctorRoom", user._id);

    const handleQueueUpdated = (payload) => {
      setQueue(payload.queue);
      setCurrentServing(payload.currentServing);
    };

    const handleReconnect = () => {
      socket.emit("joinDoctorRoom", user._id);
    };

    socket.on("queueUpdated", handleQueueUpdated);
    socket.on("connect", handleReconnect);
    return () => {
      socket.off("queueUpdated", handleQueueUpdated);
      socket.off("connect", handleReconnect);
      socket.disconnect();
    };
  }, [user._id]);

  const handleComplete = async (appointmentId) => {
    setCompletingId(appointmentId);
    try {
      await appointmentService.completeAppointment(appointmentId);
      setAppointments((prev) =>
        prev.map((a) => (a._id === appointmentId ? { ...a, status: "completed" } : a))
      );
      toast.success("Appointment marked as completed");
    } catch (err) {
      toast.error(err.response?.data?.message || "Could not complete appointment");
    } finally {
      setCompletingId(null);
    }
  };

  const handleCallNext = async () => {
    setCallingNext(true);
    try {
      await queueService.callNext(user._id);
    } catch (err) {
      toast.error(err.response?.data?.message || "No more patients in queue");
    } finally {
      setCallingNext(false);
    }
  };

  const todayCount = appointments.filter((a) => isToday(a.appointmentDate)).length;
  const confirmed = appointments.filter((a) => a.status === "confirmed").length;
  const completed = appointments.filter((a) => a.status === "completed").length;
  const cancelled = appointments.filter((a) => a.status === "cancelled").length;

  return (
    <AuthenticatedLayout>
      <div className="mx-auto max-w-5xl px-6 py-8">
        {/* Header */}
        <div>
          <h1 className="text-xl font-semibold text-gray-900">Dr. {user?.name}</h1>
          <p className="mt-0.5 text-sm text-gray-500">
            {new Date().toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
          </p>
        </div>

        {/* Stats */}
        {isLoading ? (
          <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
            {[...Array(4)].map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : (
          <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
            <DashboardCard label="Today" value={todayCount} icon={Calendar} accent="blue" />
            <DashboardCard label="Confirmed" value={confirmed} icon={CalendarCheck} accent="green" />
            <DashboardCard label="Completed" value={completed} icon={CheckCircle} accent="gray" />
            <DashboardCard label="Cancelled" value={cancelled} icon={CalendarX} accent="red" />
          </div>
        )}

        {/* Live queue */}
        {!isLoading && queue.length > 0 && (
          <div className="mt-10">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-semibold text-gray-900">Live Queue</h2>
                <p className="text-xs text-gray-400">{queue.length} patient{queue.length !== 1 ? "s" : ""} checked in today</p>
              </div>
              <button
                type="button"
                onClick={handleCallNext}
                disabled={callingNext}
                className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
              >
                <ChevronRight className="h-4 w-4" />
                {callingNext ? "Calling…" : "Call Next"}
              </button>
            </div>

            <div className="mt-4 space-y-2">
              {queue.map((entry) => {
                const isServing = entry._id.toString() === currentServing;
                return (
                  <div
                    key={entry._id}
                    className={`flex items-center justify-between rounded-xl px-5 py-4 transition-all ${
                      isServing
                        ? "border border-blue-200 bg-blue-50 shadow-sm"
                        : "bg-white ring-1 ring-gray-100"
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <span className={`text-xl font-black ${isServing ? "text-blue-600" : "text-gray-300"}`}>
                        #{entry.queueNumber}
                      </span>
                      <div>
                        <p className="text-sm font-medium text-gray-800">{entry.patientName}</p>
                        <p className="text-xs text-gray-400">{entry.appointmentTime}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {isServing ? (
                        <>
                          <span className="flex items-center gap-1.5 rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-700">
                            <span className="h-1.5 w-1.5 rounded-full bg-blue-500" />
                            Serving
                          </span>
                        </>
                      ) : (
                        <span className="text-xs text-gray-400">~{entry.estimatedWait} min</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Appointment list */}
        <div className="mt-10">
          <h2 className="text-base font-semibold text-gray-900">All Appointments</h2>

          {isLoading ? (
            <div className="mt-4 space-y-3">
              {[...Array(3)].map((_, i) => <SkeletonRow key={i} />)}
            </div>
          ) : appointments.length === 0 ? (
            <div className="mt-4">
              <EmptyState
                icon={Users}
                title="No appointments yet"
                description="Patients will appear here once they book with you."
              />
            </div>
          ) : (
            <div className="mt-4 space-y-2">
              {appointments.map((appt) => (
                <div
                  key={appt._id}
                  className={`flex items-start justify-between gap-4 rounded-xl bg-white px-5 py-4 ring-1 ring-gray-100 transition-opacity ${
                    appt.status === "cancelled" ? "opacity-40" : ""
                  }`}
                >
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-gray-900">{appt.patient?.name}</p>
                    <p className="mt-0.5 text-xs text-gray-400">
                      {new Date(appt.appointmentDate).toLocaleDateString("en-IN", {
                        weekday: "short", day: "numeric", month: "short",
                      })}{" "}
                      · {appt.appointmentTime}
                      {isToday(appt.appointmentDate) && (
                        <span className="ml-2 rounded-full bg-blue-50 px-2 py-0.5 text-xs font-semibold text-blue-600">
                          Today
                        </span>
                      )}
                    </p>
                    {appt.reason && (
                      <p className="mt-0.5 truncate text-xs italic text-gray-400">
                        &ldquo;{appt.reason}&rdquo;
                      </p>
                    )}
                  </div>
                  <div className="flex shrink-0 items-center gap-3">
                    <AppointmentStatusBadge status={appt.status} />
                    {appt.status === "confirmed" && (
                      <button
                        type="button"
                        onClick={() => handleComplete(appt._id)}
                        disabled={completingId === appt._id}
                        className="rounded-lg border border-green-200 bg-green-50 px-3 py-1.5 text-xs font-semibold text-green-700 hover:bg-green-100 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-1 disabled:opacity-50"
                      >
                        {completingId === appt._id ? "Saving…" : "Complete"}
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </AuthenticatedLayout>
  );
}

export default DoctorDashboard;
